import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, ArrowRight, Fuel } from 'lucide-react';

export default function RideCard({ ride, index = 0 }) {
  const seatsLeft = (ride.total_seats || 0) - (ride.booked_seats || 0);
  const occupancyPct = ((ride.booked_seats || 0) / (ride.total_seats || 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {ride.driver_name?.[0]?.toUpperCase() || 'D'}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{ride.driver_name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-blue-400 fill-blue-400" />
              <span className="text-xs text-muted-foreground">{ride.driver_rating || '5.0'} · Driver</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">${ride.price_per_seat}</p>
          <p className="text-xs text-muted-foreground">per seat</p>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-primary/30" />
          <div className="w-0.5 h-8 bg-gradient-to-b from-primary/60 to-blue-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-blue-400/30" />
        </div>
        <div className="flex flex-col justify-between h-12 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate">{ride.pickup_location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground truncate">{ride.dropoff_location}</span>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-primary/70" />
          <span>{ride.departure_date} at {ride.departure_time}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="w-3.5 h-3.5 text-primary/70" />
          <span className={seatsLeft <= 1 ? 'text-blue-400 font-semibold' : 'text-muted-foreground'}>
            {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left
          </span>
        </div>
        {ride.vehicle_make && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Fuel className="w-3.5 h-3.5 text-primary/70" />
            <span>{ride.vehicle_make}</span>
          </div>
        )}
      </div>

      {/* Seat occupancy bar */}
      <div className="mb-4">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${occupancyPct}%` }}
            transition={{ duration: 0.8, delay: 0.2 + index * 0.06 }}
            className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full"
          />
        </div>
      </div>

      {/* Action */}
      <Link to={`/ride/${ride._id || ride.id}`}>
        <motion.div
          whileHover={{ x: 3 }}
          className="flex items-center justify-between"
        >
          <span className="text-xs text-muted-foreground">{ride.notes || 'No special requirements'}</span>
          <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}