import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import RideCard from '../components/RideCard';
import SkeletonCard from '../components/SkeletonCard';
import GlassButton from '../components/GlassButton';
import { api, auth } from '@/api/api';
import { Search, SlidersHorizontal, MapPin, Clock, X, ChevronDown } from 'lucide-react';
import { debounce } from 'lodash';
import { DateSelect } from '../components/DateSelect';

export default function FindRide() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [sortBy, setSortBy] = useState('departure');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Read URL params
    const params = new URLSearchParams(window.location.search);
    setSearchFrom(params.get('from') || '');
    setSearchTo(params.get('to') || '');
    setSearchDate(params.get('date') || '');
  }, []);

  useEffect(() => {
    loadRides();
  }, []);

  // Removed Base44 Realtime Subscription

  const loadRides = async () => {
    setLoading(true);
    try {
      const data = await api.get('/rides', { status: 'active', limit: 50 });
      setRides(data);
    } catch (e) {
      console.error(e);
      setRides([]);
    }
    setLoading(false);
  };

  const filteredRides = rides.filter(ride => {
    const fromMatch = !searchFrom || ride.pickup_location?.toLowerCase().includes(searchFrom.toLowerCase());
    const toMatch = !searchTo || ride.dropoff_location?.toLowerCase().includes(searchTo.toLowerCase());
    const dateMatch = !searchDate || ride.departure_date === searchDate;
    const priceMatch = !maxPrice || ride.price_per_seat <= parseFloat(maxPrice);
    const hasSeats = (ride.total_seats - (ride.booked_seats || 0)) > 0;
    return fromMatch && toMatch && dateMatch && priceMatch && hasSeats;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price_per_seat - b.price_per_seat;
    if (sortBy === 'seats') return (b.total_seats - b.booked_seats) - (a.total_seats - a.booked_seats);
    return new Date(`${a.departure_date} ${a.departure_time}`) - new Date(`${b.departure_date} ${b.departure_time}`);
  });

  const clearSearch = () => {
    setSearchFrom('');
    setSearchTo('');
    setSearchDate('');
    setMaxPrice('');
  };

  return (
    <div className="min-h-screen font-inter">
      <Navbar />
      <div className="pt-20 pb-12">
        {/* Search Header */}
        <div className="bg-card/50 backdrop-blur-xl border-b border-border/50 sticky top-16 z-40">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <input
                  value={searchFrom}
                  onChange={e => setSearchFrom(e.target.value)}
                  placeholder="From..."
                  className="w-full pl-9 pr-4 py-2.5 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/60" />
                <input
                  value={searchTo}
                  onChange={e => setSearchTo(e.target.value)}
                  placeholder="To..."
                  className="w-full pl-9 pr-4 py-2.5 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition"
                />
              </div>
              <div className="relative min-w-[200px] flex-1">
                <DateSelect 
                  value={searchDate} 
                  onChange={setSearchDate} 
                  className="py-2.5 bg-background/60" 
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-background/60 border-border text-muted-foreground hover:text-foreground'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-4 pt-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Max Price ($)</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        placeholder="Any"
                        className="w-24 px-3 py-1.5 bg-background/60 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 transition"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Sort by</label>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="px-3 py-1.5 bg-background/60 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 transition"
                      >
                        <option value="departure">Departure Time</option>
                        <option value="price">Price (Lowest)</option>
                        <option value="seats">Most Seats</option>
                      </select>
                    </div>
                    {(searchFrom || searchTo || searchDate || maxPrice) && (
                      <button onClick={clearSearch} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-3.5 h-3.5" /> Clear all
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-5xl mx-auto px-4 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Available Rides</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {loading ? 'Searching...' : `${filteredRides.length} ride${filteredRides.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <GlassButton variant="secondary" size="sm" onClick={loadRides}>
              Refresh
            </GlassButton>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredRides.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No rides found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Try adjusting your search criteria or check back later for new rides.
              </p>
              <GlassButton onClick={clearSearch} variant="secondary">Clear Filters</GlassButton>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            >
              {filteredRides.map((ride, i) => (
                <RideCard key={ride._id || ride.id} ride={ride} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}