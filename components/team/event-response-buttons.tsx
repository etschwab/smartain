import { ThumbsDown, ThumbsUp } from "lucide-react";
import { SubmitButton } from "@/components/forms/submit-button";
import { respondToEventAction } from "@/lib/actions";
import type { ResponseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type EventResponseButtonsProps = {
  teamId: string;
  eventId: string;
  returnPath: string;
  currentStatus?: ResponseStatus | null;
  disabled?: boolean;
  compact?: boolean;
};

const options = [
  { status: "yes" as const, label: "Dabei", icon: ThumbsUp },
  { status: "no" as const, label: "Nicht dabei", icon: ThumbsDown }
];

export function EventResponseButtons({
  teamId,
  eventId,
  returnPath,
  currentStatus,
  disabled = false,
  compact = false
}: EventResponseButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Teilnahme auswählen">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = currentStatus === option.status;

        return (
          <form key={option.status} action={respondToEventAction.bind(null, teamId, eventId)}>
            <input type="hidden" name="status" value={option.status} />
            <input type="hidden" name="return_path" value={returnPath} />
            <SubmitButton
              variant={isActive ? (option.status === "yes" ? "primary" : "danger") : "secondary"}
              size={compact ? "sm" : "default"}
              disabled={disabled}
              pendingLabel="..."
              aria-pressed={isActive}
              aria-label={option.status === "yes" ? "Teilnahme zusagen" : "Teilnahme absagen"}
              className={cn(compact && "min-w-10 px-3", !compact && "flex-1")}
            >
              <Icon className="h-4 w-4" />
              <span className={cn(compact && "sr-only sm:not-sr-only")}>{option.label}</span>
            </SubmitButton>
          </form>
        );
      })}
    </div>
  );
}
