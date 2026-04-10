import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/api';
import { X, Star } from 'lucide-react';
import GlassButton from './GlassButton';

export default function ReviewModal({ ride, user, onClose, revieweeEmail, revieweeName }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      await api.post('/reviews', {
        ride_id: ride.id || ride._id,
        reviewer_email: user.email,
        reviewer_name: user.full_name,
        reviewee_email: revieweeEmail || ride.driver_email,
        rating,
        comment,
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setDone(true);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        {done ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">⭐</p>
            <h3 className="text-xl font-bold text-foreground">Review Submitted!</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Leave a Review</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Rating {revieweeName || ride.driver_name}</p>
            <div className="flex items-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoveredRating(s)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(s)}
                >
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <Star className={`w-8 h-8 transition-colors ${(hoveredRating || rating) >= s ? 'text-blue-400 fill-blue-400' : 'text-muted-foreground'}`} />
                  </motion.div>
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition mb-4"
            />
            <GlassButton className="w-full" onClick={handleSubmit} loading={loading} disabled={!rating}>
              Submit Review
            </GlassButton>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}