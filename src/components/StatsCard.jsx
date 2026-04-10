import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, color = 'cyan', trend, index = 0 }) {
  const colorMap = {
    cyan: { bg: 'from-primary/20 to-blue-600/10', border: 'border-primary/20', icon: 'text-primary', badge: 'bg-primary/10 text-primary' },
    orange: { bg: 'from-blue-400/20 to-blue-400/5', border: 'border-blue-400/20', icon: 'text-blue-400', badge: 'bg-blue-400/10 text-blue-400' },
    teal: { bg: 'from-blue-600/20 to-blue-600/5', border: 'border-blue-600/20', icon: 'text-blue-600', badge: 'bg-blue-600/10 text-blue-600' },
    green: { bg: 'from-green-500/20 to-green-500/5', border: 'border-green-500/20', icon: 'text-green-400', badge: 'bg-green-500/10 text-green-400' },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-card/50 flex items-center justify-center ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${c.badge}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}