import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassButton from '../components/GlassButton';
import { api, auth } from '@/api/api';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Car, Star, CheckCircle, Edit3, Save } from 'lucide-react';

const inputClass = "w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    phone: '',
    bio: '',
    vehicle_make: '',
    vehicle_color: '',
    vehicle_plate: '',
    role: 'both',
  });

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    setForm({
      phone: user.phone || '',
      bio: user.bio || '',
      vehicle_make: user.vehicle_make || '',
      vehicle_color: user.vehicle_color || '',
      vehicle_plate: user.vehicle_plate || '',
      role: user.role || 'both',
    });
    loadReviews();
  }, [user]);

  const loadReviews = async () => {
    if (!user) return;
    try {
      const data = await api.get('/reviews', { reviewee_email: user.email });
      setReviews(data);
    } catch { setReviews([]); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await auth.updateMe({ ...form, profile_completed: true });
    } catch (e) {
      console.error('Update failed', e);
    }
    setLoading(false);
    setEditing(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  if (!user) return null;

  return (
    <div className="min-h-screen font-inter">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-3xl font-black text-primary">
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground">{user.full_name}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {reviews.length > 0 && [...Array(Math.round(parseFloat(avgRating) || 0))].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                    ))}
                    <span className="text-sm text-foreground font-semibold ml-1">{typeof avgRating === 'number' ? avgRating : avgRating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">· {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Edit3 className="w-4 h-4" /> {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Role Badge */}
          <div className="flex gap-2 flex-wrap">
            {['driver', 'rider', 'both'].map(r => (
              <button
                key={r}
                onClick={() => editing && setForm(prev => ({ ...prev, role: r }))}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  form.role === r
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : editing ? 'border-border text-muted-foreground hover:border-primary/20' : 'hidden'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
            {!editing && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                {form.role}
              </span>
            )}
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                disabled={!editing}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                disabled={!editing}
                placeholder="Tell riders a bit about yourself..."
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
        </motion.div>

        {/* Vehicle Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" /> Vehicle Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Make & Model</label>
              <input
                value={form.vehicle_make}
                onChange={e => setForm(p => ({ ...p, vehicle_make: e.target.value }))}
                disabled={!editing}
                placeholder="e.g. Tesla Model 3"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Color</label>
                <input
                  value={form.vehicle_color}
                  onChange={e => setForm(p => ({ ...p, vehicle_color: e.target.value }))}
                  disabled={!editing}
                  placeholder="Pearl White"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Plate</label>
                <input
                  value={form.vehicle_plate}
                  onChange={e => setForm(p => ({ ...p, vehicle_plate: e.target.value }))}
                  disabled={!editing}
                  placeholder="ABC-1234"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassButton className="w-full" size="lg" onClick={handleSave} loading={loading}>
              <Save className="w-4 h-4" /> Save Profile
            </GlassButton>
          </motion.div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 mt-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" /> Reviews ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/40 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">by {review.reviewer_name}</span>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}