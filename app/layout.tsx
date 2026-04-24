import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmarTrain",
  description: "Kostenlose Team- und Trainingsverwaltung"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
