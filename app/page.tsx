import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-full bg-brand-100 px-4 py-2 text-sm font-medium text-brand-900">
        SmarTrain Starter
      </div>
      <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-950">
        Verwalte Teams, Spieler, Trainings und Spiele kostenlos.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-slate-600">
        Eine moderne Basis-App mit Next.js, Supabase und Vercel. Perfekt als Startpunkt fuer deine eigene
        SpielerPlus-Alternative.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/login" className="btn">Einloggen</Link>
        <Link href="/dashboard" className="btn-secondary">Dashboard testen</Link>
      </div>
    </main>
  );
}
