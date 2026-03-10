"use client";

import { api } from "@app-catolico/backend/convex/_generated/api";
import { Button } from "@app-catolico/ui/components/button";
import { useQuery } from "convex/react";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const healthCheck = useQuery(api.healthCheck.get);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">App Católico</h1>
        <p className="mt-2 text-muted-foreground">
          Direção espiritual para católicos
        </p>
      </div>
      <div className="flex flex-col items-center gap-6">
        <Link href="/prototipo">
          <Button size="lg" className="gap-2">
            <Heart className="size-4" />
            Ver protótipo para apresentação
          </Button>
        </Link>
        <section className="w-full max-w-sm rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck === "OK" ? "bg-green-500" : healthCheck === undefined ? "bg-orange-400" : "bg-red-500"}`}
            />
            <span className="text-sm text-muted-foreground">
              {healthCheck === undefined
                ? "Checking..."
                : healthCheck === "OK"
                  ? "Connected"
                  : "Error"}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
