import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold">Seite nicht gefunden</h1>
      <Link href="/dashboard" className="btn mt-6">Zurück zum Dashboard</Link>
    </main>
  );
}
