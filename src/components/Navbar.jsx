import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Car, Search, Menu, X, MessageCircle, User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const navLinks = [
    { label: 'Find a Ride', href: '/find-ride', icon: Search },
    { label: 'Offer a Ride', href: '/offer-ride', icon: Car },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Paddle<span className="text-primary">Share</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 ${
                  location.pathname === href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/chat" className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors relative">
                  <MessageCircle className="w-4.5 h-4.5" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-foreground max-w-24 truncate">{user.full_name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-white/5 transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                        </Link>
                        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-white/5 transition-colors">
                          <User className="w-4 h-4 text-primary" /> Profile
                        </Link>
                        <div className="border-t border-border" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSignIn}
                  className="hidden md:block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-background rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40"
                >
                  Get Started
                </button>
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ label, href }) => (
                <Link key={href} to={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium">
                  {label}
                </Link>
              ))}
              {user && (
                <>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium">
                    <MessageCircle className="w-4 h-4" /> Messages
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium text-destructive">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

