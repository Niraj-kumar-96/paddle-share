import React from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateSelect({ value, onChange, className }) {
  // Add a dummy time to prevent date-fns from parsing YYYY-MM-DD as UTC and shifting back a day
  const date = value ? new Date(value + 'T12:00:00') : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-start px-4 py-3 bg-background/60 border border-border rounded-xl text-sm transition-all hover:bg-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
            !date ? "text-muted-foreground" : "text-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-3 h-4 w-4 text-primary/60" />
          {date ? format(date, "MMM do, yyyy") : <span>Pick a date</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-xl z-[100]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              const formatted = format(d, 'yyyy-MM-dd');
              onChange(formatted);
            } else {
              onChange('');
            }
          }}
          disabled={(d) => d < new Date().setHours(0,0,0,0)}
          initialFocus
          className="bg-card text-foreground rounded-xl [&_.rdp-day_button:hover]:bg-primary/20 [&_.rdp-day_button[aria-selected='true']]:bg-primary [&_.rdp-day_button[aria-selected='true']]:text-white"
        />
      </PopoverContent>
    </Popover>
  );
}
