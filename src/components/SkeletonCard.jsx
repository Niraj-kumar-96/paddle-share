export default function SkeletonCard() {
  return (
    <div className="bg-card/60 border border-border/60 rounded-2xl p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted animate-shimmer bg-gradient-to-r from-muted via-border to-muted bg-[length:200%_100%]" />
          <div className="space-y-2">
            <div className="w-28 h-3.5 rounded-full bg-muted animate-shimmer bg-gradient-to-r from-muted via-border to-muted bg-[length:200%_100%]" />
            <div className="w-20 h-2.5 rounded-full bg-muted animate-shimmer bg-gradient-to-r from-muted via-border to-muted bg-[length:200%_100%]" />
          </div>
        </div>
        <div className="w-16 h-8 rounded-lg bg-muted animate-shimmer bg-gradient-to-r from-muted via-border to-muted bg-[length:200%_100%]" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-3/4 h-3 rounded-full bg-muted animate-shimmer bg-gradient-to-r from-muted via-border to-muted bg-[length:200%_100%]" />
        <div className="w-1/2 h-3 rounded-full bg-muted animate-shimmer bg-gradient-to-r from-muted via-border to-muted bg-[length:200%_100%]" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="w-24 h-2.5 rounded-full bg-muted animate-shimmer bg-gradient-to-r from-muted via-border to-muted bg-[length:200%_100%]" />
        <div className="w-20 h-2.5 rounded-full bg-muted animate-shimmer bg-gradient-to-r from-muted via-border to-muted bg-[length:200%_100%]" />
      </div>
      <div className="h-1 bg-muted rounded-full" />
    </div>
  );
}