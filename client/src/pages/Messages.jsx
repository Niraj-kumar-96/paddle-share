import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, auth } from '@/api/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';

function ConversationList({ conversations, activeKey, onSelect }) {
  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
        <MessageCircle className="h-10 w-10 mb-3" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conv) => (
        <motion.button
          key={conv.key}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(conv)}
          className={`w-full text-left p-3 rounded-xl transition-all ${
            activeKey === conv.key
              ? 'bg-secondary/10 border border-secondary/20'
              : 'hover:bg-muted'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {conv.otherName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{conv.otherName}</p>
              <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
            </div>
            {conv.unread > 0 && (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs text-white font-bold">{conv.unread}</span>
              </div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function ChatView({ user, conversation, messages, onSend, onBack }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {conversation?.otherName?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-sm font-semibold">{conversation?.otherName}</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => {
            const isMe = msg.sender_email === user.email;
            return (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {moment(msg.created_date).format('h:mm A')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            className="flex-1 h-11 rounded-xl"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const [user, setUser] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const withEmail = urlParams.get('with');

  useEffect(() => {
    auth.me().then(setUser);
  }, []);

  const { data: allMessages } = useQuery({
    queryKey: ['messages', user?.email],
    queryFn: () => api.get('/messages', { sender_email: user.email })
      .then(async (sent) => {
        const received = await api.get('/messages', { receiver_email: user.email });
        return [...sent, ...received].sort((a, b) => new Date(a.created_date || a.createdAt).getTime() - new Date(b.created_date || b.createdAt).getTime());
      }),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  // Build conversations
  const conversations = (() => {
    if (!allMessages || !user) return [];
    const convMap = {};
    allMessages.forEach((msg) => {
      const otherEmail = msg.sender_email === user.email ? msg.receiver_email : msg.sender_email;
      const otherName = msg.sender_email === user.email ? (msg.receiver_name || otherEmail) : (msg.sender_name || otherEmail);
      const key = [user.email, otherEmail].sort().join('__');
      if (!convMap[key]) {
        convMap[key] = { key, otherEmail, otherName, lastMessage: msg.content, unread: 0, messages: [] };
      }
      convMap[key].messages.push(msg);
      convMap[key].lastMessage = msg.content;
      if (msg.receiver_email === user.email && !msg.is_read) {
        convMap[key].unread++;
      }
    });
    return Object.values(convMap);
  })();

  // Auto-select conversation from URL
  useEffect(() => {
    if (withEmail && user && !activeConv) {
      const key = [user.email, withEmail].sort().join('__');
      const existing = conversations.find(c => c.key === key);
      if (existing) {
        setActiveConv(existing);
        setShowChat(true);
      } else {
        setActiveConv({ key, otherEmail: withEmail, otherName: withEmail, messages: [] });
        setShowChat(true);
      }
    }
  }, [withEmail, user, conversations.length]);

  const activeMessages = activeConv
    ? (allMessages || []).filter(m => {
        const key = [m.sender_email, m.receiver_email].sort().join('__');
        return key === activeConv.key;
      })
    : [];

  const handleSend = async (content) => {
    if (!activeConv || !user) return;
    await api.post('/messages', {
      conversation_key: activeConv.key,
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: activeConv.otherEmail,
      content,
      ride_id: urlParams.get('ride') || '',
      is_read: false,
    });
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-background">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeKey={activeConv?.key}
            onSelect={(conv) => { setActiveConv(conv); setShowChat(true); }}
          />
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 ${!showChat ? 'hidden md:flex' : 'flex'} flex-col`}>
        {activeConv ? (
          <ChatView
            user={user}
            conversation={activeConv}
            messages={activeMessages}
            onSend={handleSend}
            onBack={() => setShowChat(false)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}