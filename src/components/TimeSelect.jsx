import React from 'react';
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TimeSelect({ value, onChange, className }) {
  // Generate 15-minute intervals
  const times = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 24; i++) {
        const hh = i.toString().padStart(2, '0');
        const iAmPm = i % 12 || 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        
        // 00, 15, 30, 45
        for (let j of [0, 15, 30, 45]) {
            const mm = j.toString().padStart(2, '0');
            arr.push({
                val: `${hh}:${mm}`,
                label: `${iAmPm}:${mm} ${ampm}`
            });
        }
    }
    return arr;
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full px-4 py-6 bg-background/60 border border-border rounded-xl text-sm focus:ring-1 focus:ring-primary/20 hover:bg-background transition-all", className)}>
        <div className="flex items-center gap-3 text-foreground">
          <Clock className="w-4 h-4 text-primary/60" />
          <SelectValue placeholder="Pick a time">
            {value ? times.find(t => t.val === value)?.label : "Pick a time"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-60 bg-card border-border z-[100]">
        {times.map((t) => (
          <SelectItem key={t.val} value={t.val} className="cursor-pointer focus:bg-primary/20 focus:text-primary">
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
