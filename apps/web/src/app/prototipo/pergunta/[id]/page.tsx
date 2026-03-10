"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app-catolico/ui/components/card";
import { Button } from "@app-catolico/ui/components/button";
import { ArrowLeft, MessageCircle, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const DADOS: Record<
  string,
  {
    pergunta: string;
    status: string;
    respostas: { diretor: string; texto: string }[];
    consenso: string;
  }
> = {
  "1": {
    pergunta:
      "Tenho muita dificuldade em lidar com meu filho, fico irritado e grito com ele.",
    status: "consensus_ready",
    respostas: [
      {
        diretor: "Pe. João",
        texto: "Rezar um terço pedindo paciência e refletir antes de reagir. O silêncio de alguns segundos antes de responder pode mudar tudo.",
      },
      {
        diretor: "Ir. Maria",
        texto: "Peça ao Espírito Santo a virtude da paciência. Faça um exame de consciência à noite: em quais situações perdi a calma? Ofereça isso em reparação.",
      },
      {
        diretor: "Pe. Antônio",
        texto: "Recomendo orar o Salmo 131 e buscar momentos de silêncio diário. A caridade começa em casa – seu filho precisa ver em você um modelo de autocontrole.",
      },
    ],
    consenso:
      "Recomendamos orar pedindo a virtude da paciência, especialmente um terço ou o Salmo 131. Antes de reagir, faça uma pausa de alguns segundos. Faça um breve exame de consciência ao fim do dia para identificar os gatilhos e ofereça as dificuldades em reparação.",
  },
  "2": {
    pergunta:
      "Sinto-me distante de Deus na oração. Os momentos de silêncio me deixam inquieto.",
    status: "answering",
    respostas: [
      {
        diretor: "Ir. Teresa",
        texto: "A inquietude é humana. Tente começar com apenas 5 minutos de silêncio, sem expectativas. Deus está ali mesmo quando parece vazio.",
      },
    ],
    consenso: "",
  },
  "3": {
    pergunta:
      "Estou passando por um conflito no trabalho e não sei como agir com sabedoria.",
    status: "pending",
    respostas: [],
    consenso: "",
  },
};

export default function PrototipoPerguntaPage() {
  const params = useParams();
  const id = params.id as string;
  const dados = DADOS[id];

  if (!dados) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Pergunta não encontrada.</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href="/prototipo">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/prototipo" className="flex items-center gap-2">
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
      </Button>

      {/* Pergunta */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Sua pergunta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">
            {dados.pergunta}
          </p>
        </CardContent>
      </Card>

      {/* Orientação final (consenso) */}
      {dados.consenso && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-base text-primary">
                Orientação Final
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {dados.consenso}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Respostas dos diretores */}
      {dados.respostas.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageCircle className="size-4" />
            Respostas dos Diretores ({dados.respostas.length})
          </h3>
          <div className="space-y-3">
            {dados.respostas.map((r, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">
                      {r.diretor}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground">
                    {r.texto}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {dados.respostas.length === 0 && !dados.consenso && (
        <p className="text-center text-sm text-muted-foreground">
          Ainda não há respostas. Os diretores espirituais serão notificados.
        </p>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Protótipo • Dados simulados
      </p>
    </div>
  );
}
