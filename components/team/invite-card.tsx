import { CopyInviteButton } from "@/components/clipboard/copy-invite-button";
import { ShareInviteButton } from "@/components/clipboard/share-invite-button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildJoinPath, formatDateTimeLabel } from "@/lib/utils";
import type { TeamInvite } from "@/lib/types";

type InviteCardProps = {
  invite: TeamInvite;
  absoluteUrl: string;
  regenerateAction?: () => Promise<void>;
  toggleAction?: () => Promise<void>;
};

export function InviteCard({ invite, absoluteUrl, regenerateAction, toggleAction }: InviteCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Einladungslink</p>
            <h3 className="text-xl font-semibold">{invite.team_name}</h3>
          </div>
          <Badge variant={invite.is_active ? "success" : "muted"}>{invite.is_active ? "Aktiv" : "Pausiert"}</Badge>
        </div>
        <div className="rounded-3xl border border-border bg-background/70 p-4 text-sm">
          <p className="font-mono text-xs text-muted-foreground">{buildJoinPath(invite.code)}</p>
          <p className="mt-2 font-semibold break-all">{absoluteUrl}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyInviteButton value={absoluteUrl} />
          <ShareInviteButton title={`Einladung zu ${invite.team_name}`} url={absoluteUrl} />
          {regenerateAction ? (
            <form action={regenerateAction}>
              <Button type="submit" variant="secondary">
                Link erneuern
              </Button>
            </form>
          ) : null}
          {toggleAction ? (
            <form action={toggleAction}>
              <ConfirmSubmit
                type="submit"
                confirmMessage={invite.is_active ? "Link wirklich deaktivieren?" : "Link wieder aktivieren?"}
                variant="ghost"
              >
                {invite.is_active ? "Deaktivieren" : "Aktivieren"}
              </ConfirmSubmit>
            </form>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Rolle im Join-Flow: {invite.role}</span>
          {invite.expires_at ? <span>Gueltig bis {formatDateTimeLabel(invite.expires_at)}</span> : <span>Ohne Ablauf</span>}
          {invite.last_used_at ? <span>Zuletzt genutzt {formatDateTimeLabel(invite.last_used_at)}</span> : null}
        </div>
      </div>
    </Card>
  );
}
