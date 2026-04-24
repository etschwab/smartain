import { Nav } from "./nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <Nav />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
