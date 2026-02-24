"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  if (!hasClerkKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      {children}
    </ClerkProvider>
  );
}
