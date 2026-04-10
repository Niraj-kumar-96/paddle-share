import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Car className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-6xl font-black text-foreground mb-3">404</h1>
        <p className="text-xl font-semibold text-foreground mb-2">Road Not Found</p>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Looks like this road doesn't exist. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-semibold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}