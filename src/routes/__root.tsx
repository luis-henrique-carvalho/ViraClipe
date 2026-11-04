import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import "@/styles/index.css";
import { Sparkles } from "lucide-react";

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "Card2Ad • Do Card ao Vídeo em 15 Segundos" },
      {
        name: "description",
        content:
          "Transforme cards de social media e posts do Instagram em vídeos de anúncio de alta conversão de 15 segundos com tipografia cinética e narração.",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <html lang="pt-BR">
        <head>
          <HeadContent />
        </head>
        <body className="min-h-screen bg-[#F6F4EF] text-[#111111] antialiased selection:bg-[#FFE6DB] selection:text-[#D9420D]">
          {/* Header Global Estilo URL2Ad */}
          <header className="sticky top-0 z-50 bg-[#F6F4EF]/90 backdrop-blur-md border-b border-[#E3DFD6]/70">
            <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
                  C<span className="text-[#FF5A1F]">2</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-[#111111]">
                  Card<b className="text-[#FF5A1F]">2Ad</b>
                </span>
              </a>

              <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#55534E]">
                <a href="#como-funciona" className="hover:text-[#111111] transition-colors">
                  Como Funciona
                </a>
                <a href="#demonstracao" className="hover:text-[#111111] transition-colors">
                  Demonstração
                </a>
                <a href="#formatos" className="hover:text-[#111111] transition-colors">
                  Formatos
                </a>
                <a href="#precos" className="hover:text-[#111111] transition-colors">
                  Preços
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <a
                  href="#criar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#D9420D] text-white font-bold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Criar Anúncio
                </a>
              </div>
            </div>
          </header>

          <main>
            <Outlet />
          </main>

          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  );
}
