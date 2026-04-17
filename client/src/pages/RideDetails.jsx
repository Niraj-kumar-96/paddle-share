import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassButton from '../components/GlassButton';
import ReviewModal from '../components/ReviewModal';
import { api, auth } from '@/api/api';
import { useAuth } from '@/lib/AuthContext';
import {
  MapPin, Clock, Users, Star, Car, MessageCircle, ArrowLeft,
  Shield, Fuel, ChevronRight, X, CheckCircle, AlertCircle
} from 'lucide-react';

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [existingBooking, setExistingBooking] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    loadRide();
  }, [id]);

  const loadRide = async () => {
    setLoading(true);
    try {
      const rideData = await api.get('/rides/' + id);
      setRide(rideData);
      if (user) {
        const bookings = await api.get('/bookings');
        const existing = bookings.find(b => (b.ride_id?._id === id || b.ride_id === id));
        if (existing) setExistingBooking(existing);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!user) { auth.redirectToLogin('/ride/' + id); return; }
    setBookingLoading(true);
    try {
      const booking = await api.post('/bookings', {
        ride_id: id,
        seats_booked: seatsToBook,
        total_price: seatsToBook * ride.price_per_seat,
        status: 'confirmed',
        pickup_location: ride.pickup_location,
        dropoff_location: ride.dropoff_location,
        departure_date: ride.departure_date,
        departure_time: ride.departure_time,
      });
      setExistingBooking(booking);
      setRide(prev => ({ ...prev, booked_seats: (prev.booked_seats || 0) + seatsToBook }));
      setBookingSuccess(true);
      setTimeout(() => { setShowBooking(false); setBookingSuccess(false); }, 2500);
    } catch (e) {
      console.error('Booking failed', e);
    }
    setBookingLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen font-inter">
        <Navbar />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="h-8 w-32 bg-muted rounded-lg mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-card rounded-2xl animate-pulse" />)}
            </div>
            <div className="h-72 bg-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter">
        <Navbar />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Ride Not Found</h2>
          <GlassButton onClick={() => navigate('/find-ride')}>Back to Search</GlassButton>
        </div>
      </div>
    );
  }

  const seatsLeft = (ride.total_seats || 0) - (ride.booked_seats || 0);
  const isDriver = user?.email === ride.driver_email;

  const convKey = user ? [user.email, ride.driver_email].sort().join('_') : null;

  return (
    <div className="min-h-screen font-inter">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Link to="/find-ride" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Search
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Route Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-6"
              >
                <h1 className="text-2xl font-black text-foreground mb-6">
                  {ride.pickup_location} <span className="text-primary">→</span> {ride.dropoff_location}
                </h1>
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    {ride.departure_date} at {ride.departure_time}
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-medium ${seatsLeft <= 1 ? 'text-blue-400' : 'text-muted-foreground'}`}>
                    <Users className="w-4 h-4" />
                    {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left
                  </div>
                </div>

                {/* Visual Route */}
                <div className="bg-background/40 rounded-xl p-4 mb-4">
                  <div className="flex items-stretch gap-4">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-primary to-blue-400 min-h-8" />
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-h-16">
                      <div>
                        <p className="text-xs text-muted-foreground">FROM</p>
                        <p className="font-semibold text-foreground">{ride.pickup_location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">TO</p>
                        <p className="font-semibold text-foreground">{ride.dropoff_location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seat bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{ride.booked_seats || 0} booked</span>
                    <span>{seatsLeft} remaining</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((ride.booked_seats || 0) / ride.total_seats) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Vehicle Info */}
              {ride.vehicle_make && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-6"
                >
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" /> Vehicle
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-xs text-muted-foreground">Make & Model</p><p className="font-medium text-foreground text-sm mt-1">{ride.vehicle_make}</p></div>
                    <div><p className="text-xs text-muted-foreground">Color</p><p className="font-medium text-foreground text-sm mt-1">{ride.vehicle_color || '–'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Plate</p><p className="font-medium text-foreground text-sm mt-1">{ride.vehicle_plate || '–'}</p></div>
                  </div>
                </motion.div>
              )}

              {/* Notes */}
              {ride.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-6"
                >
                  <h2 className="text-lg font-bold text-foreground mb-2">Driver Notes</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{ride.notes}</p>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Driver Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-6"
              >
                <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Driver</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-xl font-black text-primary">
                    {ride.driver_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{ride.driver_name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                      <span className="text-sm text-muted-foreground">5.0 · Verified</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded-xl">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  ID Verified · Member since {new Date(ride.created_date).getFullYear()}
                </div>
              </motion.div>

              {/* Price & Book */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-6"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-3xl font-black text-foreground">${ride.price_per_seat}</span>
                    <span className="text-sm text-muted-foreground ml-1">/ seat</span>
                  </div>
                  {seatsLeft <= 2 && seatsLeft > 0 && (
                    <span className="text-xs bg-blue-400/10 text-blue-400 border border-blue-400/20 px-2 py-1 rounded-lg font-semibold">
                      Only {seatsLeft} left!
                    </span>
                  )}
                </div>

                {existingBooking ? (
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-2 text-primary mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Booked!</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{existingBooking.seats_booked} seat(s) reserved</p>
                  </div>
                ) : isDriver ? (
                  <div className="text-center py-2 text-sm text-muted-foreground">This is your ride</div>
                ) : seatsLeft === 0 ? (
                  <div className="text-center py-2 text-sm text-blue-400 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Fully Booked
                  </div>
                ) : (
                  <GlassButton className="w-full" size="lg" onClick={() => {
                    if (!user) { auth.redirectToLogin(); return; }
                    setShowBooking(true);
                  }}>
                    Book Now
                  </GlassButton>
                )}

                {!isDriver && user && user.email !== ride.driver_email && (
                  <Link
                    to={`/chat/${convKey}?rideId=${id}&driverEmail=${ride.driver_email}&driverName=${ride.driver_name}`}
                    className="flex items-center justify-center gap-2 mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Message Driver
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => !bookingLoading && setShowBooking(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              {bookingSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-1">Booking Confirmed!</h3>
                  <p className="text-sm text-muted-foreground">{seatsToBook} seat(s) reserved</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground">Book Your Seat</h3>
                    <button onClick={() => setShowBooking(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-3">How many seats?</p>
                    <div className="flex items-center justify-center gap-6">
                      <button
                        onClick={() => setSeatsToBook(s => Math.max(1, s - 1))}
                        className="w-10 h-10 rounded-xl bg-muted hover:bg-border border border-border transition-colors text-lg font-bold"
                      >-</button>
                      <motion.span
                        key={seatsToBook}
                        initial={{ scale: 1.4, color: '#00B4D8' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl font-black"
                      >
                        {seatsToBook}
                      </motion.span>
                      <button
                        onClick={() => setSeatsToBook(s => Math.min(seatsLeft, s + 1))}
                        className="w-10 h-10 rounded-xl bg-muted hover:bg-border border border-border transition-colors text-lg font-bold"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl mb-5">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <motion.span
                      key={seatsToBook * ride.price_per_seat}
                      initial={{ scale: 1.1, color: '#00B4D8' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-2xl font-black"
                    >
                      ${seatsToBook * ride.price_per_seat}
                    </motion.span>
                  </div>
                  <GlassButton className="w-full" size="lg" onClick={handleBook} loading={bookingLoading}>
                    Confirm Booking
                  </GlassButton>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReview && (
          <ReviewModal
            ride={ride}
            user={user}
            onClose={() => setShowReview(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}