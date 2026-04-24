export type Team = {
  id: string;
  name: string;
  age_group: string | null;
  created_at: string;
};

export type Player = {
  id: string;
  team_id: string | null;
  first_name: string;
  last_name: string;
  position: string | null;
  number: number | null;
  created_at: string;
};

export type Training = {
  id: string;
  team_id: string;
  title: string;
  starts_at: string;
  location: string | null;
};

export type Match = {
  id: string;
  team_id: string;
  opponent: string;
  starts_at: string;
  location: string | null;
  home_away: "home" | "away";
};
