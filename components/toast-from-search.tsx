"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { toastMessages } from "@/lib/constants";

export function ToastFromSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const toastKey = searchParams.get("toast");

    if (!toastKey) {
      return;
    }

    const message = toastMessages[toastKey] ?? "Aktion erfolgreich";
    const next = new URLSearchParams(searchParams.toString());
    next.delete("toast");
    if (toastKey.includes("failed") || toastKey.includes("error")) {
      toast.error(message);
    } else {
      toast.success(message);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
