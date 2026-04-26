import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://smartain.vercel.app"),
  title: {
    default: "SmarTrain",
    template: "%s | SmarTrain"
  },
  description: "Moderne Team-Management- und Trainings-App für Coaches, Spieler und Eltern.",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          id="smartrain-theme"
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("smartrain-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}'
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
