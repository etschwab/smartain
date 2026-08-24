import { Suspense } from "react";
import { headers } from "next/headers";
import { PublicFooter } from "@/components/public-footer";
import { PublicNavbar } from "@/components/public-navbar";
import { ToastFromSearch } from "@/components/toast-from-search";
import { isAuthHostname, requestHostname } from "@/lib/sso";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();

  if (isAuthHostname(requestHostname(requestHeaders))) {
    return <div className="min-h-screen">{children}</div>;
  }

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
