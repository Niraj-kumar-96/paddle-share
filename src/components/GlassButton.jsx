import { motion } from 'framer-motion';

export default function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) {
  const variants = {
    primary: 'bg-primary text-background hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40',
    secondary: 'bg-white/5 text-foreground border border-border hover:bg-white/10 hover:border-primary/30',
    orange: 'bg-blue-400 text-white hover:bg-blue-400/90 shadow-lg shadow-blue-400/25 hover:shadow-blue-400/40',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-white/5',
    danger: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-xl',
    xl: 'px-8 py-4 text-base rounded-2xl',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </motion.button>
  );
}