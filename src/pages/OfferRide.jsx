import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassButton from '../components/GlassButton';
import { api, auth } from '@/api/api';
import { useAuth } from '@/lib/AuthContext';
import { MapPin, Clock, DollarSign, Users, Car, ChevronRight, CheckCircle } from 'lucide-react';
import { DateSelect } from '../components/DateSelect';
import { TimeSelect } from '../components/TimeSelect';

const steps = [
  { id: 1, title: 'Route', desc: 'Where are you going?' },
  { id: 2, title: 'Schedule', desc: 'When do you leave?' },
  { id: 3, title: 'Vehicle', desc: 'What are you driving?' },
  { id: 4, title: 'Pricing', desc: 'Set your price' },
];

const inputClass = "w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition";

export default function OfferRide() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    pickup_location: '',
    dropoff_location: '',
    departure_date: '',
    departure_time: '',
    vehicle_make: '',
    vehicle_color: '',
    vehicle_plate: '',
    total_seats: 3,
    price_per_seat: '',
    notes: '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const canProceed = () => {
    if (step === 1) return form.pickup_location && form.dropoff_location;
    if (step === 2) return form.departure_date && form.departure_time;
    if (step === 3) return form.vehicle_make;
    if (step === 4) return form.price_per_seat;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) { auth.redirectToLogin(); return; }
    setLoading(true);
    try {
      await api.post('/rides', {
        ...form,
        driver_email: user.email,
        driver_name: user.full_name,
        booked_seats: 0,
        status: 'active',
        price_per_seat: parseFloat(form.price_per_seat),
        total_seats: form.total_seats,
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (e) {
      console.error('Failed to create ride', e);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-black text-foreground mb-2">Ride Published!</h2>
          <p className="text-muted-foreground">Your ride is now live. Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-1">Offer a Ride</h1>
          <p className="text-muted-foreground">Share your journey and cover your fuel costs</p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    backgroundColor: step >= s.id ? 'rgb(0,180,216)' : 'transparent',
                    borderColor: step >= s.id ? 'rgb(0,180,216)' : 'rgba(255,255,255,0.1)',
                  }}
                  className="w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-bold text-foreground"
                >
                  {step > s.id ? <CheckCircle className="w-4 h-4 text-background" /> : (
                    <span className={step >= s.id ? 'text-background' : 'text-muted-foreground'}>{s.id}</span>
                  )}
                </motion.div>
                <p className={`text-xs font-medium mt-1.5 hidden sm:block ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-2 bg-border">
                  <motion.div
                    animate={{ scaleX: step > s.id ? 1 : 0 }}
                    className="h-full bg-primary origin-left"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 sm:p-8 mb-6"
        >
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Your Route
              </h2>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Pickup Location</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  <input
                    value={form.pickup_location}
                    onChange={e => update('pickup_location', e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Dropoff Location</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400" />
                  <input
                    value={form.dropoff_location}
                    onChange={e => update('dropoff_location', e.target.value)}
                    placeholder="e.g. Los Angeles, CA"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Additional Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  placeholder="Any special info for riders? (e.g. pet-friendly, luggage limit...)"
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Departure
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Date</label>
                  <DateSelect 
                    value={form.departure_date} 
                    onChange={v => update('departure_date', v)} 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Time</label>
                  <TimeSelect 
                    value={form.departure_time} 
                    onChange={v => update('departure_time', v)} 
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" /> Vehicle Info
              </h2>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Make & Model *</label>
                <input
                  value={form.vehicle_make}
                  onChange={e => update('vehicle_make', e.target.value)}
                  placeholder="e.g. Tesla Model 3"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Color</label>
                  <input
                    value={form.vehicle_color}
                    onChange={e => update('vehicle_color', e.target.value)}
                    placeholder="e.g. Pearl White"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Plate</label>
                  <input
                    value={form.vehicle_plate}
                    onChange={e => update('vehicle_plate', e.target.value)}
                    placeholder="e.g. ABC-1234"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Pricing & Seats
              </h2>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wide">Price per Seat ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                  <input
                    type="number"
                    value={form.price_per_seat}
                    onChange={e => update('price_per_seat', e.target.value)}
                    placeholder="25"
                    min="1"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-3 block font-medium uppercase tracking-wide">Available Seats</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => update('total_seats', Math.max(1, form.total_seats - 1))}
                    className="w-10 h-10 rounded-xl border border-border bg-muted hover:bg-border transition-colors text-lg font-bold"
                  >-</button>
                  <motion.span
                    key={form.total_seats}
                    initial={{ scale: 1.3, color: '#00B4D8' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl font-black text-foreground w-10 text-center"
                  >
                    {form.total_seats}
                  </motion.span>
                  <button
                    type="button"
                    onClick={() => update('total_seats', Math.min(8, form.total_seats + 1))}
                    className="w-10 h-10 rounded-xl border border-border bg-muted hover:bg-border transition-colors text-lg font-bold"
                  >+</button>
                  <span className="text-sm text-muted-foreground">seats</span>
                </div>
              </div>
              {/* Preview */}
              {form.price_per_seat && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                >
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Earnings Estimate</p>
                  <p className="text-2xl font-black text-primary">
                    ${(parseFloat(form.price_per_seat) * form.total_seats).toFixed(2)}
                    <span className="text-sm text-muted-foreground font-normal ml-2">if fully booked</span>
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <GlassButton variant="secondary" onClick={prevStep} disabled={step === 1} size="lg">
            Back
          </GlassButton>
          {step < 4 ? (
            <GlassButton onClick={nextStep} disabled={!canProceed()} size="lg" className="flex-1 sm:flex-none">
              Continue <ChevronRight className="w-4 h-4" />
            </GlassButton>
          ) : (
            <GlassButton onClick={handleSubmit} loading={loading} disabled={!canProceed()} size="lg" className="flex-1 sm:flex-none">
              Publish Ride 🚗
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
}