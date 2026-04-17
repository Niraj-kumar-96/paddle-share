import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassButton from '../components/GlassButton';
import { api, auth } from '@/api/api';
import { useAuth } from '@/lib/AuthContext';
import { Send, ArrowLeft, MessageCircle, Circle } from 'lucide-react';

export default function Chat() {
  const { conversationKey } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeConv, setActiveConv] = useState(null);
  const [convPartner, setConvPartner] = useState({ name: '', email: '' });
  const messagesEndRef = useRef(null);

  // Parse URL params for direct conversation
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const driverEmail = params.get('driverEmail');
    const driverName = params.get('driverName');
    const rideId = params.get('rideId');
    if (conversationKey && driverEmail) {
      setActiveConv(conversationKey);
      setConvPartner({ name: driverName || 'Driver', email: driverEmail });
    }
    loadConversations();
  }, [user, conversationKey]);

  useEffect(() => {
    if (activeConv) loadMessages(activeConv);
  }, [activeConv]);

  // Removed Base44 custom subscription. Relying on interval logic or react-query is recommended for the future.

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const loadConversations = async () => {
    if (!user) return;
    try {
      const sent = await api.get('/messages', { sender_email: user.email });
      const received = await api.get('/messages', { receiver_email: user.email });
      const all = [...sent, ...received];
      const convMap = {};
      all.forEach(msg => {
        if (!convMap[msg.conversation_key] || new Date(msg.created_date || msg.createdAt) > new Date(convMap[msg.conversation_key].created_date || convMap[msg.conversation_key].createdAt)) {
          convMap[msg.conversation_key] = msg;
        }
      });
      setConversations(Object.values(convMap).sort((a, b) => new Date(b.created_date || b.createdAt).getTime() - new Date(a.created_date || a.createdAt).getTime()));
      if (conversationKey && !activeConv) setActiveConv(conversationKey);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (convKey) => {
    try {
      const data = await api.get('/messages', { conversation_key: convKey });
      setMessages(data);
      // Mark as read
      const unread = data.filter(m => m.receiver_email === user?.email && !m.is_read);
      unread.forEach(m => api.put('/messages/' + (m._id || m.id), { is_read: true }));
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const msgData = {
      conversation_key: activeConv,
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: convPartner.email,
      content: newMessage.trim(),
      is_read: false,
    };
    // Optimistic UI
    const tempMsg = { ...msgData, id: 'temp-' + Date.now(), created_date: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    await api.post('/messages', msgData);
    setSending(false);
    loadMessages(activeConv);
  };

  const selectConversation = (conv) => {
    const partner = conv.sender_email === user?.email
      ? { email: conv.receiver_email, name: conv.receiver_email.split('@')[0] }
      : { email: conv.sender_email, name: conv.sender_name };
    setActiveConv(conv.conversation_key);
    setConvPartner(partner);
  };

  const unreadCount = (convKey) => {
    return messages.filter(m => m.conversation_key === convKey && m.receiver_email === user?.email && !m.is_read).length;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter">
        <Navbar />
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access messages</p>
          <GlassButton onClick={() => auth.redirectToLogin()}>Sign In</GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <Navbar />
      <div className="pt-16 h-screen flex">
        <div className="flex-1 max-w-5xl mx-auto flex h-full">
          {/* Sidebar */}
          <div className={`w-full sm:w-72 flex-shrink-0 border-r border-border/50 flex flex-col ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border/50">
              <h2 className="font-bold text-foreground">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Book a ride to chat with drivers</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const partner = conv.sender_email === user.email
                    ? { email: conv.receiver_email, name: conv.sender_name === user.full_name ? conv.receiver_email.split('@')[0] : conv.sender_name }
                    : { email: conv.sender_email, name: conv.sender_name };
                  const isActive = activeConv === conv.conversation_key;
                  return (
                    <button
                      key={conv.conversation_key}
                      onClick={() => selectConversation(conv)}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left border-b border-border/30 ${isActive ? 'bg-primary/5 border-l-2 border-l-cyan' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {partner.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{partner.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{conv.content}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden sm:flex' : 'flex'}`}>
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm">
                  <button onClick={() => setActiveConv(null)} className="sm:hidden">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {convPartner.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{convPartner.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Circle className="w-2 h-2 fill-green-400 text-green-400" /> Online
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                      const isOwn = msg.sender_email === user.email;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwn && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary mr-2 flex-shrink-0 mt-auto">
                              {convPartner.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isOwn
                                  ? 'bg-primary text-background rounded-br-sm'
                                  : 'bg-card border border-border/60 text-foreground rounded-bl-sm'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <p className="text-[10px] text-muted-foreground px-1">
                              {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                    />
                    <motion.button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary text-background disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 transition-opacity"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}