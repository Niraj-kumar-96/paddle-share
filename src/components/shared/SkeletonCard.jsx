import { motion } from 'framer-motion';

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card rounded-2xl border border-border p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
        <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
      </div>
    </motion.div>
  );
}