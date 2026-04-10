import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function SeatCounter({ value, onChange, max = 4, min = 1 }) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="relative w-12 h-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-2xl font-bold text-primary absolute"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}