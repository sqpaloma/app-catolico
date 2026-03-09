"use client";

import { env } from "@app-catolico/env/web";
import { Toaster } from "@app-catolico/ui/components/sonner";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { ThemeProvider } from "./theme-provider";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
      <Toaster richColors />
    </ThemeProvider>
  );
}
