import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import GlassButton from '../components/GlassButton';
import ReviewModal from '../components/ReviewModal';
import { api, auth } from '@/api/api';
import { useAuth } from '@/lib/AuthContext';
import {
  Car, Users, DollarSign, Star, Clock, MapPin,
  CheckCircle, XCircle, ChevronRight, Plus, Calendar, BarChart3,
  MessageCircle, Route
} from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'rides', label: 'My Rides' },
  { id: 'bookings', label: 'Bookings' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [myRides, myBookings] = await Promise.all([
        api.get('/rides', { driver_email: user.email }),
        api.get('/bookings', { rider_email: user.email }),
      ]);
      setRides(myRides);
      setBookings(myBookings);
    } catch {
      setRides([]); setBookings([]);
    }
    setLoading(false);
  };

  const cancelRide = async (rideId) => {
    try {
      await api.put('/rides/' + rideId, { status: 'cancelled' });
      setRides(prev => prev.map(r => r._id === rideId || r.id === rideId ? { ...r, status: 'cancelled' } : r));
    } catch (e) { console.error('Error cancelling ride', e); }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await api.put('/bookings/' + bookingId, { status: 'cancelled' });
      setBookings(prev => prev.map(b => b._id === bookingId || b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (e) { console.error('Error cancelling booking', e); }
  };

  const activeRides = rides.filter(r => r.status === 'active');
  const totalEarnings = rides.reduce((sum, r) => sum + ((r.booked_seats || 0) * (r.price_per_seat || 0)), 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');

  const statusBadge = (status) => {
    const map = {
      active: 'bg-primary/10 text-primary border-primary/20',
      confirmed: 'bg-primary/10 text-primary border-primary/20',
      pending: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
      completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    };
    return `text-xs px-2.5 py-1 rounded-lg border font-medium ${map[status] || map.pending}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen font-inter">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-6"
          >
            <div>
              <h1 className="text-3xl font-black text-foreground">
                Hey, {user.full_name?.split(' ')[0]} 👋
              </h1>
              <p className="text-muted-foreground mt-1">Welcome back to your dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/chat">
                <GlassButton variant="secondary" size="sm">
                  <MessageCircle className="w-4 h-4" /> Messages
                </GlassButton>
              </Link>
              <Link to="/offer-ride">
                <GlassButton size="sm">
                  <Plus className="w-4 h-4" /> Offer Ride
                </GlassButton>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard icon={Car} label="Active Rides" value={activeRides.length} color="cyan" index={0} />
            <StatsCard icon={Users} label="Total Bookings" value={confirmedBookings.length} color="teal" index={1} />
            <StatsCard icon={DollarSign} label="Earnings" value={`$${totalEarnings.toFixed(0)}`} color="orange" index={2} />
            <StatsCard icon={Star} label="Rating" value="5.0" color="green" index={3} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/30 p-1 rounded-xl mb-6 w-fit">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Rides */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-foreground flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> My Rides</h2>
                  <button onClick={() => setActiveTab('rides')} className="text-xs text-primary hover:text-primary/80">View all</button>
                </div>
                {loading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
                ) : rides.slice(0, 3).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-3">No rides offered yet</p>
                    <Link to="/offer-ride"><GlassButton size="sm">Offer Your First Ride</GlassButton></Link>
                  </div>
                ) : rides.slice(0, 3).map(ride => (
                  <div key={ride._id || ride.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ride.pickup_location} → {ride.dropoff_location}</p>
                      <p className="text-xs text-muted-foreground">{ride.departure_date} · {ride.booked_seats || 0}/{ride.total_seats} booked</p>
                    </div>
                    <span className={statusBadge(ride.status)}>{ride.status}</span>
                  </div>
                ))}
              </motion.div>

              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-foreground flex items-center gap-2"><Route className="w-4 h-4 text-primary" /> My Bookings</h2>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs text-primary hover:text-primary/80">View all</button>
                </div>
                {loading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
                ) : bookings.slice(0, 3).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-3">No bookings yet</p>
                    <Link to="/find-ride"><GlassButton size="sm">Find a Ride</GlassButton></Link>
                  </div>
                ) : bookings.slice(0, 3).map(booking => (
                  <div key={booking._id || booking.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{booking.pickup_location} → {booking.dropoff_location}</p>
                      <p className="text-xs text-muted-foreground">{booking.departure_date} · {booking.seats_booked} seat(s) · ${booking.total_price}</p>
                    </div>
                    <span className={statusBadge(booking.status)}>{booking.status}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          {activeTab === 'rides' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}</div>
              ) : rides.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Rides Yet</h3>
                  <p className="text-muted-foreground mb-4">Start offering rides and earn money on your trips</p>
                  <Link to="/offer-ride"><GlassButton>Offer Your First Ride</GlassButton></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {rides.map((ride, i) => (
                    <motion.div
                      key={ride._id || ride.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card/60 border border-border/60 rounded-2xl p-5 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{ride.pickup_location} → {ride.dropoff_location}</p>
                        <p className="text-sm text-muted-foreground">{ride.departure_date} at {ride.departure_time} · {ride.booked_seats || 0}/{ride.total_seats} seats · ${ride.price_per_seat}/seat</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={statusBadge(ride.status)}>{ride.status}</span>
                        {ride.status === 'active' && (
                          <button
                            onClick={() => cancelRide(ride._id || ride.id)}
                            className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}</div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground mb-4">Find and book rides to start traveling</p>
                  <Link to="/find-ride"><GlassButton>Find a Ride</GlassButton></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking, i) => (
                    <motion.div
                      key={booking._id || booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card/60 border border-border/60 rounded-2xl p-5 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{booking.pickup_location} → {booking.dropoff_location}</p>
                        <p className="text-sm text-muted-foreground">{booking.departure_date} · {booking.seats_booked} seat(s) · <span className="text-foreground font-medium">${booking.total_price}</span></p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={statusBadge(booking.status)}>{booking.status}</span>
                        {(booking.status === 'confirmed' || booking.status === 'completed') && (
                          <button
                            onClick={() => setReviewTarget(booking)}
                            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" /> Review
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => cancelBooking(booking._id || booking.id)}
                            className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {reviewTarget && (
        <ReviewModal
          ride={reviewTarget}
          user={user}
          revieweeEmail={reviewTarget.driver_email}
          revieweeName="your driver"
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}