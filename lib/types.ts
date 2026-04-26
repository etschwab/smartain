export type TeamRole = "owner" | "coach" | "player" | "parent";
export type MemberStatus = "active" | "pending" | "inactive";
export type EventType = "training" | "game" | "meeting" | "event";
export type ResponseStatus = "yes" | "no" | "maybe";
export type TaskStatus = "open" | "done";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  jersey_number: number | null;
  position: string | null;
  birthday: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  name: string;
  sport: string;
  season: string;
  logo_url: string | null;
  theme_color: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  status: MemberStatus;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamWithMembership = Team & {
  membership: TeamMember;
};

export type MemberWithProfile = TeamMember & {
  profile: Profile | null;
};

export type TeamInvite = {
  id: string;
  team_id: string;
  code: string;
  token?: string | null;
  team_name: string;
  team_sport: string;
  role: TeamRole;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRecord = {
  id: string;
  team_id: string;
  title: string;
  type: EventType;
  starts_at: string;
  ends_at: string;
  location: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EventResponseRecord = {
  id: string;
  event_id: string;
  user_id: string;
  status: ResponseStatus;
  comment: string | null;
  responded_at: string;
  created_at: string;
  updated_at: string;
};

export type EventWithTeam = EventRecord & {
  team: Team | null;
  response: EventResponseRecord | null;
};

export type TaskRecord = {
  id: string;
  team_id: string;
  event_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string | null;
  status: TaskStatus;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskWithRelations = TaskRecord & {
  assignee: Profile | null;
  event: EventRecord | null;
};

export type NotificationRecord = {
  id: string;
  user_id: string;
  team_id: string | null;
  event_id: string | null;
  task_id: string | null;
  type: string;
  title: string;
  body: string;
  action_path: string | null;
  is_read: boolean;
  created_at: string;
};

export type EventResponseCounts = {
  yes: number;
  no: number;
  maybe: number;
  pending: number;
};
