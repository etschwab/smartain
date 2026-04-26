import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import type { EventRecord } from "@/lib/types";
import { cn, getEventTypeLabel } from "@/lib/utils";

type EventCalendarProps = {
  events: EventRecord[];
};

export function EventCalendar({ events }: EventCalendarProps) {
  const referenceDate = events[0] ? new Date(events[0].starts_at) : new Date();
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="section-kicker">Kalenderansicht</p>
          <h3 className="text-xl font-semibold">{format(referenceDate, "MMMM yyyy", { locale: de })}</h3>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-muted-foreground">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((weekday) => (
          <div key={weekday} className="py-2">
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayEvents = events.filter((event) => new Date(event.starts_at).toDateString() === day.toDateString());

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[112px] rounded-3xl border border-border/80 bg-background/70 p-3 text-left",
                !isSameMonth(day, referenceDate) && "opacity-40"
              )}
            >
              <div className="mb-3 text-sm font-semibold">{format(day, "d", { locale: de })}</div>
              <div className="space-y-2">
                {dayEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="rounded-2xl bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                    <div className="truncate">{event.title}</div>
                    <div className="text-[10px] text-primary/80">{getEventTypeLabel(event.type)}</div>
                  </div>
                ))}
                {dayEvents.length > 3 ? (
                  <div className="text-[11px] font-medium text-muted-foreground">+{dayEvents.length - 3} weitere</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
