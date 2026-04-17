import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, ArrowRight, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import moment from 'moment';

export default function RideCard({ ride, index = 0 }) {
  const seatsLeft = ride.total_seats - (ride.booked_seats || 0);
  const isFull = seatsLeft <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link to={`/ride/${ride.id}`} className="block">
        <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-xl hover:shadow-primary/5 hover:border-secondary/30 transition-all duration-300 group">
          {/* Driver Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {ride.driver_name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{ride.driver_name}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent fill-accent" />
                  <span className="text-xs text-muted-foreground">4.8</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">${ride.price_per_seat}</p>
              <p className="text-xs text-muted-foreground">per seat</p>
            </div>
          </div>

          {/* Route */}
          <div className="relative pl-6 space-y-3 mb-4">
            <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gradient-to-b from-secondary to-accent rounded-full" />
            <div className="relative">
              <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-card" />
              <p className="text-sm font-medium text-foreground truncate">{ride.pickup_location}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-accent border-2 border-card" />
              <p className="text-sm font-medium text-foreground truncate">{ride.dropoff_location}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Calendar className="h-3 w-3" />
              {moment(ride.departure_date).format('MMM D')}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Clock className="h-3 w-3" />
              {ride.departure_time}
            </Badge>
            <Badge
              variant={isFull ? 'destructive' : 'secondary'}
              className="gap-1.5 font-normal"
            >
              <Users className="h-3 w-3" />
              {isFull ? 'Full' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}
            </Badge>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-secondary" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}