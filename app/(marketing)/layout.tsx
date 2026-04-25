import { Suspense } from "react";
import { PublicFooter } from "@/components/public-footer";
import { PublicNavbar } from "@/components/public-navbar";
import { ToastFromSearch } from "@/components/toast-from-search";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <Suspense fallback={null}>
        <ToastFromSearch />
      </Suspense>
      {children}
      <PublicFooter />
    </div>
  );
}
