"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app-catolico/ui/components/card";
import { Button } from "@app-catolico/ui/components/button";
import { Heart, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const PERGUNTAS_EXEMPLO = [
  {
    id: "1",
    texto: "Tenho muita dificuldade em lidar com meu filho, fico irritado e grito com ele.",
    status: "consensus_ready" as const,
    respostas: 3,
  },
  {
    id: "2",
    texto: "Sinto-me distante de Deus na oração. Os momentos de silêncio me deixam inquieto.",
    status: "answering" as const,
    respostas: 1,
  },
  {
    id: "3",
    texto: "Estou passando por um conflito no trabalho e não sei como agir com sabedoria.",
    status: "pending" as const,
    respostas: 0,
  },
];

const STATUS_LABEL = {
  pending: "Aguardando diretores",
  answering: "Em resposta",
  consensus_ready: "Orientação disponível",
};

const STATUS_CLASS = {
  pending: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  answering: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  consensus_ready: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
};

export default function PrototipoPage() {
  const [texto, setTexto] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    toast.success(
      "Sua mensagem foi enviada! Os diretores espirituais irão oferecer orientação.",
    );
    setTexto("");
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Direção Espiritual
        </h1>
        <p className="mt-2 text-muted-foreground">
          Compartilhe o que está no seu coração e receba orientação de diretores
          espirituais voluntários.
        </p>
      </div>

      {/* Formulário */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-lg">
            O que está aflindo você?
          </CardTitle>
          <CardDescription>
            Escreva livremente. Sua mensagem será tratada com respeito e sigilo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Descreva o que está no seu coração..."
              rows={5}
              className="w-full resize-none rounded-none border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="submit" size="lg" disabled={!texto.trim()}>
              <Send className="size-4" />
              Enviar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Exemplos de perguntas */}
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        Exemplo: Suas perguntas
      </h2>
      <div className="space-y-3">
        {PERGUNTAS_EXEMPLO.map((p) => (
          <Link key={p.id} href={`/prototipo/pergunta/${p.id}`}>
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-sm font-medium">
                    {p.texto}
                  </CardTitle>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <CardDescription className="flex items-center gap-1.5">
                  <MessageCircle className="size-3.5" />
                  {p.respostas}{" "}
                  {p.respostas === 1 ? "resposta" : "respostas"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Protótipo para apresentação ao cliente • Dados simulados
      </p>
    </div>
  );
}
