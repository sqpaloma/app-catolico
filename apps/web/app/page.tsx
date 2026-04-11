import Image from "next/image";

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v20M7 7h10" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: EyeOffIcon,
    title: "Completamente Anônimo",
    description:
      "Ninguém saberá quem você é. Compartilhe com total liberdade e segurança.",
  },
  {
    icon: ShieldIcon,
    title: "Direção Espiritual",
    description:
      "Receba orientação de diretores espirituais formados na fé católica.",
  },
  {
    icon: MessageIcon,
    title: "Perguntas e Respostas",
    description:
      "Escreva o que está no seu coração e receba respostas com caridade e sabedoria.",
  },
  {
    icon: BookIcon,
    title: "Versículo do Dia",
    description:
      "Comece o dia com a Palavra de Deus para iluminar sua jornada espiritual.",
  },
  {
    icon: HeartIcon,
    title: "Feed de Reflexões",
    description:
      "Leia e compartilhe reflexões que aquecem a alma e fortalecem a fé.",
  },
  {
    icon: SparkleIcon,
    title: "Orientação com IA",
    description:
      "Respostas iniciais com inteligência artificial treinada na doutrina católica.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Baixe o app",
    description: "Disponível gratuitamente para Android e iOS.",
  },
  {
    number: "2",
    title: "Crie sua conta",
    description:
      "Rápido e seguro. Sua identidade é protegida em cada interação.",
  },
  {
    number: "3",
    title: "Compartilhe sua alma",
    description:
      "Escreva de forma anônima e receba orientação espiritual personalizada.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 z-50 w-full border-b border-warm-300/50 bg-warm-100/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-600">
              <Image
                src="/logo.png"
                alt="Safe"
                width={20}
                height={20}
                className="brightness-0 invert"
              />
            </div>
            <span className="text-xl font-bold tracking-wider text-burgundy-600">
              SAFE
            </span>
          </div>
          <a
            href="#download"
            className="rounded-full bg-burgundy-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-burgundy-700"
          >
            Baixar App
          </a>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-24">
        <div
          className="absolute inset-0 h-[700px]"
          style={{
            background:
              "linear-gradient(180deg, #8B1A1A 0%, #A52422 35%, #b5726a 70%, #f5f0eb 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
            <Image
              src="/logo.png"
              alt="Safe"
              width={48}
              height={48}
              className="brightness-0 invert"
            />
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Um espaço seguro
            <br />
            <span className="text-white/80">para sua alma</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Compartilhe o que está no seu coração de forma completamente anônima
            e receba orientação espiritual baseada na fé católica.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#download"
              className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-semibold text-burgundy-600 shadow-xl transition-transform hover:scale-105"
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 2.3a.75.75 0 0 0-.756-.06l-9.3 4.9-4.2-2.4a.75.75 0 0 0-.892.166.75.75 0 0 0-.166.892L4.8 9.6l-2.6 2.6a.75.75 0 0 0 0 1.06l2.6 2.6-2.59 3.8a.75.75 0 0 0 1.058 1.058l4.2-2.4 9.3 4.9a.75.75 0 0 0 .755-.06A.75.75 0 0 0 18 22.5v-19.5a.75.75 0 0 0-.477-.7zM16.5 20.4l-8.15-4.3a.75.75 0 0 0-.7 0L5.06 17.7 6.9 14.9a.75.75 0 0 0 0-.8L5.06 11.3 7.65 12.9a.75.75 0 0 0 .7 0l8.15-4.3V20.4z" />
              </svg>
              Baixar para Android
            </a>
            <a
              href="#download"
              className="flex items-center gap-3 rounded-2xl bg-white/15 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-transform hover:scale-105"
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Em breve no iOS
            </a>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto mt-16 max-w-sm">
            <div className="relative mx-auto aspect-[9/19] w-64 overflow-hidden rounded-[2.5rem] border-4 border-white/20 bg-warm-100 shadow-2xl sm:w-72">
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(180deg, #8B1A1A 0%, #A52422 20%, #b5726a 40%, #f5f0eb 55%)",
                }}
              >
                <div className="flex flex-col items-center pt-12">
                  <Image
                    src="/logo.png"
                    alt="Safe"
                    width={36}
                    height={36}
                    className="mb-3 brightness-0 invert"
                  />
                  <p className="text-lg font-bold text-white">Bem-vindo ao Safe</p>
                  <p className="mt-1 px-8 text-center text-xs text-white/70">
                    Um espaço sagrado e anônimo para sua alma
                  </p>
                </div>
                <div className="mt-6 px-4">
                  <div className="rounded-xl bg-white p-4 shadow-lg">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-burgundy-600">
                      Versículo do Dia
                    </p>
                    <p className="mt-2 text-xs italic leading-relaxed text-gray-700">
                      &ldquo;Vinde a mim todos os que estais cansados e
                      sobrecarregados, e eu vos aliviarei.&rdquo;
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      — Mateus 11:28
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-burgundy-600 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                      <MessageIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Compartilhe o que te aflige
                      </p>
                      <p className="text-[9px] text-white/60">
                        Anônimo &bull; Seguro
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 h-8 w-48 -translate-x-1/2 rounded-full bg-black/10 blur-xl" />
          </div>
        </div>
      </section>

      {/* ─── Verse Banner ─── */}
      <section className="bg-warm-100 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <CrossIcon className="mx-auto mb-4 h-8 w-8 text-burgundy-600" />
          <blockquote className="text-xl italic leading-relaxed text-gray-700 sm:text-2xl">
            &ldquo;Vinde a mim todos os que estais cansados e sobrecarregados, e
            eu vos aliviarei.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-medium text-burgundy-500">
            Mateus 11:28
          </p>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="bg-white py-20" id="features">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-burgundy-500">
              Funcionalidades
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Tudo que você precisa para sua
              <br />
              <span className="text-burgundy-600">jornada espiritual</span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-warm-300/50 bg-warm-50 p-8 transition-all hover:border-burgundy-200 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-burgundy-600/10 text-burgundy-600 transition-colors group-hover:bg-burgundy-600 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="bg-warm-100 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-burgundy-500">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Simples como uma oração
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.number} className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-burgundy-600 text-xl font-bold text-white shadow-lg">
                  {s.number}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonial / Trust ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <HeartIcon className="mx-auto mb-6 h-10 w-10 text-burgundy-500" />
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Um espaço sagrado e anônimo
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
            Você escreve o que está no seu coração de forma completamente
            anônima. Um diretor espiritual lê e responde com orientação baseada
            na fé católica. Ninguém saberá quem você é — apenas Deus.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-burgundy-600">100%</p>
              <p className="mt-1 text-sm text-gray-400">Anônimo</p>
            </div>
            <div className="h-8 w-px bg-warm-300" />
            <div className="text-center">
              <p className="text-3xl font-bold text-burgundy-600">24/7</p>
              <p className="mt-1 text-sm text-gray-400">Disponível</p>
            </div>
            <div className="h-8 w-px bg-warm-300" />
            <div className="text-center">
              <p className="text-3xl font-bold text-burgundy-600">Grátis</p>
              <p className="mt-1 text-sm text-gray-400">Para sempre</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Download CTA ─── */}
      <section className="relative overflow-hidden py-24" id="download">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #8B1A1A 0%, #A52422 50%, #b5726a 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Image
              src="/logo.png"
              alt="Safe"
              width={36}
              height={36}
              className="brightness-0 invert"
            />
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-5xl">
            Baixe o Safe agora
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/75 sm:text-lg">
            Comece sua jornada espiritual hoje. Gratuito, anônimo e seguro.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-semibold text-burgundy-600 shadow-xl transition-transform hover:scale-105"
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.707l2.387 1.381c.524.304.524 1.062 0 1.364l-2.387 1.382-2.537-2.537 2.537-2.59zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z" />
              </svg>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-wide text-burgundy-400">
                  Disponível no
                </span>
                <span className="block text-lg font-bold leading-tight">
                  Google Play
                </span>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-transform hover:scale-105"
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-wide text-white/60">
                  Em breve na
                </span>
                <span className="block text-lg font-bold leading-tight">
                  App Store
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-warm-300/50 bg-warm-100 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy-600">
                <Image
                  src="/logo.png"
                  alt="Safe"
                  width={16}
                  height={16}
                  className="brightness-0 invert"
                />
              </div>
              <span className="text-base font-bold tracking-wider text-burgundy-600">
                SAFE
              </span>
            </div>
            <p className="text-center text-sm text-gray-400">
              Um espaço seguro para sua alma &bull; Feito com fé e caridade
            </p>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Safe
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
