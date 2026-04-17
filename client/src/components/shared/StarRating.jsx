import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StarRating({ rating, onChange, readonly = false, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };
  const iconSize = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={!readonly ? { scale: 1.2 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          onClick={() => !readonly && onChange?.(star)}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}
          disabled={readonly}
        >
          <Star
            className={`${iconSize} transition-colors ${
              star <= rating
                ? 'text-accent fill-accent'
                : 'text-muted-foreground/30'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}