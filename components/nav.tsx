import Link from "next/link";
import { CalendarDays, Dumbbell, Home, Trophy, Users } from "lucide-react";
import { signOut } from "@/lib/actions";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/players", label: "Spieler", icon: Users },
  { href: "/trainings", label: "Trainings", icon: Dumbbell },
  { href: "/matches", label: "Spiele", icon: Trophy },
  { href: "/calendar", label: "Kalender", icon: CalendarDays }
];

export function Nav() {
  return (
    <aside className="w-full border-b bg-white p-5 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <Link href="/dashboard" className="text-2xl font-bold text-brand-600">SmarTrain</Link>
      <p className="mt-2 text-sm text-slate-500">Teamverwaltung mit Supabase und Vercel.</p>
      <nav className="mt-8 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100">
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="mt-8">
        <button className="btn-secondary w-full" type="submit">Abmelden</button>
      </form>
    </aside>
  );
}
