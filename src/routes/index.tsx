import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdVideoPlayer } from "@/features/video-engine/components/AdVideoPlayer";
import {
  analyzeAndGenerateAdFn,
  fetchInstagramPostsFn,
} from "@/features/promotions/server/functions/card2ad.functions";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  Volume2,
  Smartphone,
  Zap,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Camera,
} from "lucide-react";
import type { CardAnalysisResult } from "@/features/vision-engine/data/vision.schema";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

// Análise inicial de demonstração (Favorita Modas)
const DEMO_FAVORITA_ANALYSIS: CardAnalysisResult = {
  brandName: "Favorita Modas",
  niche: "Moda Feminina",
  aesthetic: "Elegante e sofisticado",
  palette: {
    primary: "#6A2B3B",
    secondary: "#C5A880",
    accent: "#723340",
    background: "#F6F4EF",
    cardSurface: "rgba(255, 255, 255, 0.85)",
    textColor: "#2C1810",
  },
  hook: "QUER SEUS LOOKS NOVOS AINDA ESTA SEMANA?",
  scenes: [
    {
      id: 1,
      durationSec: 3.75,
      textOverlay: "QUER SEUS LOOKS NOVOS ESSA SEMANA?",
      subtext: "Na Favorita Modas o envio é rápido",
      icon: "sparkles",
    },
    {
      id: 2,
      durationSec: 3.75,
      textOverlay: "PEÇAS SOB ENCOMENDA EM 2 A 5 DIAS",
      subtext: "Seu look chega na mesma semana do pedido",
      icon: "hanger",
    },
    {
      id: 3,
      durationSec: 3.75,
      textOverlay: "PREÇO EXCLUSIVO DE ATACADO",
      subtext: "Válido para pagamentos no Pix e dinheiro físico",
      icon: "discount",
    },
    {
      id: 4,
      durationSec: 3.75,
      textOverlay: "GARANTA O SEU LOOK AGORA!",
      subtext: "Toque no link da bio e fale conosco",
      icon: "arrow_up",
    },
  ],
  voiceoverScript:
    "Quer renovar seus looks e receber ainda esta semana? Na Favorita Modas seus pedidos sob encomenda chegam rápido, com preço exclusivo de atacado no Pix ou dinheiro. Garanta o seu look agora no link da bio!",
  ctaText: "Garanta o seu look!",
  ctaSubtext: "Toque no link da bio",
};

// Imagem do card da Favorita Modas hospedada ou fallback
const DEMO_CARD_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1080&h=1920&fit=crop";

function LandingPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "instagram">("upload");
  const [cardImage, setCardImage] = useState<string>(DEMO_CARD_IMAGE);
  const [selectedVoice, setSelectedVoice] = useState<"pt-BR-FranciscaNeural" | "pt-BR-AntonioNeural">(
    "pt-BR-FranciscaNeural"
  );
  const [igHandle, setIgHandle] = useState("");
  const [igPosts, setIgPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Estado do Vídeo em Exibição
  const [videoProps, setVideoProps] = useState({
    cardAnalysis: DEMO_FAVORITA_ANALYSIS,
    backgroundImageUrl: DEMO_CARD_IMAGE,
    audioUrl: undefined as string | undefined,
  });

  // Handler: Upload de Imagem de Card
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCardImage(dataUrl);
      await generateVideoFromCard(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Handler: Buscar Posts do Perfil do Instagram
  const handleFetchInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!igHandle.trim()) return;

    setIsLoading(true);
    setStatusMessage("Carregando posts do perfil...");
    try {
      const result = await fetchInstagramPostsFn({ data: { profileUrl: igHandle } });
      setIgPosts(result.posts || []);
      setStatusMessage(`Encontrados ${result.posts.length} posts. Escolha um para transformar em anúncio!`);
    } catch (err) {
      setStatusMessage("Erro ao buscar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pipeline: Executa a Visão IA + Narração Neural + Atualiza o Player
  const generateVideoFromCard = async (imageDataUrl: string, caption?: string) => {
    setIsLoading(true);
    setStatusMessage("Analisando elementos visuais e gerando roteiro...");
    try {
      const result = await analyzeAndGenerateAdFn({
        data: {
          imageDataUrl,
          caption,
          voice: selectedVoice,
        },
      });

      setVideoProps({
        cardAnalysis: result.cardAnalysis,
        backgroundImageUrl: result.backgroundImageUrl,
        audioUrl: result.audioUrl,
      });

      setStatusMessage("Vídeo de anúncio gerado com sucesso!");
    } catch (err) {
      console.error(err);
      setStatusMessage("Erro na geração. Usando versão de prévia.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ============================================================== */}
      {/* 1. HERO SECTION ESTILO URL2AD COM DUPLA ENTRADA */}
      {/* ============================================================== */}
      <section className="pt-14 pb-20 px-6 border-b border-[#E3DFD6]/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lado Esquerdo: Copy e Formulário */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE6DB] text-[#D9420D] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Do Card ou Instagram para Anúncio em Vídeo
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111111] leading-[1.08]">
              Cole seu card. <br />
              Receba um <em className="not-italic text-[#FF5A1F]">vídeo de anúncio</em>.
            </h1>

            <p className="text-lg text-[#55534E] max-w-xl leading-relaxed">
              Diferente de ferramentas que exigem um site completo ou usam avatares falsos de IA, o{" "}
              <strong>Card2Ad</strong> lê o seu post estático, extrai sua identidade e gera um anúncio animado de 15 segundos com tipografia cinética e narração.
            </p>

            {/* Caixa de Entrada: Upload Direto vs Perfil do Instagram */}
            <div id="criar" className="w-full max-w-xl bg-white rounded-2xl p-6 border-2 border-[#111111] shadow-[0_8px_0_#111111]">
              {/* Abas */}
              <div className="flex items-center gap-2 p-1 bg-[#F6F4EF] rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-white text-[#111111] shadow-sm"
                      : "text-[#55534E] hover:text-[#111111]"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Enviar Imagem do Card
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("instagram")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "instagram"
                      ? "bg-white text-[#111111] shadow-sm"
                      : "text-[#55534E] hover:text-[#111111]"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Buscar no Instagram
                </button>
              </div>

              {/* Aba 1: Upload Direto */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-[#E3DFD6] hover:border-[#FF5A1F] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#FAF8F5]">
                    <Upload className="w-8 h-8 text-[#FF5A1F]" />
                    <span className="text-sm font-bold text-[#111111]">
                      Clique para subir seu card (PNG ou JPG)
                    </span>
                    <span className="text-xs text-[#55534E]">
                      Cards do Canva, Photoshop, banners ou prints do feed
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
              )}

              {/* Aba 2: Perfil do Instagram */}
              {activeTab === "instagram" && (
                <div className="space-y-4">
                  <form onSubmit={handleFetchInstagram} className="flex gap-2">
                    <Input
                      placeholder="@seu.perfil ou link do Instagram"
                      value={igHandle}
                      onChange={(e) => setIgHandle(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading} className="shrink-0">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Carregar"}
                    </Button>
                  </form>

                  {/* Grid de Posts do Instagram */}
                  {igPosts.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-[#55534E] uppercase">
                        Selecione um post para gerar:
                      </span>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                        {igPosts.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => generateVideoFromCard(post.mediaUrl, post.caption)}
                            className="aspect-square rounded-lg overflow-hidden border border-[#E3DFD6] hover:border-[#FF5A1F] hover:scale-105 transition-all cursor-pointer relative group"
                          >
                            <img
                              src={post.mediaUrl}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                            {post.isCarousel && (
                              <div className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">
                                Carrossel
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seletor de Voz Neural */}
              <div className="mt-4 pt-4 border-t border-[#E3DFD6] flex items-center justify-between text-xs text-[#55534E]">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Voz da Narração:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVoice("pt-BR-FranciscaNeural")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      selectedVoice === "pt-BR-FranciscaNeural"
                        ? "bg-[#111111] text-white"
                        : "hover:bg-[#E3DFD6]"
                    }`}
                  >
                    Feminina (Francisca)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVoice("pt-BR-AntonioNeural")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      selectedVoice === "pt-BR-AntonioNeural"
                        ? "bg-[#111111] text-white"
                        : "hover:bg-[#E3DFD6]"
                    }`}
                  >
                    Masculina (Antônio)
                  </button>
                </div>
              </div>

              {/* Feedback de Status */}
              {statusMessage && (
                <div className="mt-3 text-xs font-semibold text-[#D9420D] bg-[#FFE6DB] px-3 py-2 rounded-lg flex items-center gap-2">
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {statusMessage}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 text-xs text-[#55534E]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" /> Prévia 100% gratuita
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" /> 3 formatos inclusos (9:16, 4:5, 1:1)
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" /> Sem cartão para testar
              </span>
            </div>
          </div>

          {/* Lado Direito: Player de Vídeo Remotion Interativo */}
          <div id="demonstracao" className="lg:col-span-5 flex flex-col items-center">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#D9420D]">
              Exemplo Real • Gerado a partir do Card Enviado
            </div>
            <AdVideoPlayer props={videoProps} initialAspectRatio="9:16" />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. COMO FUNCIONA EM 3 PASSOS (ESTILO URL2AD) */}
      {/* ============================================================== */}
      <section id="como-funciona" className="py-20 px-6 border-b border-[#E3DFD6]/60 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Do seu card estático ao anúncio em vídeo em três passos.
            </h2>
            <p className="mt-3 text-[#55534E] text-base">
              Sem necessidade de edição, sem briefing demorado e sem equipe de vídeo. Seu card já tem tudo o que o anúncio precisa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#F6F4EF] border border-[#E3DFD6] relative">
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center font-black text-lg mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2">Envie o Card ou Perfil</h3>
              <p className="text-sm text-[#55534E] leading-relaxed">
                Faça o upload do seu criativo (PNG ou JPG) ou informe o seu @perfil do Instagram para escolher os melhores posts da sua grade.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F6F4EF] border border-[#E3DFD6] relative">
              <div className="w-10 h-10 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center font-black text-lg mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2">A IA Analisa e Narra</h3>
              <p className="text-sm text-[#55534E] leading-relaxed">
                Nossa visão computacional extrai ganchos, cores da marca, prazos e condições comerciais, estruturando um roteiro falado em 15 segundos.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F6F4EF] border border-[#E3DFD6] relative">
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center font-black text-lg mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2">Assista e Decida</h3>
              <p className="text-sm text-[#55534E] leading-relaxed">
                Assista à prévia em tempo real com narração sincronizada. Se gostar, faça o download nos 3 formatos prontos para campanhas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. REGRAS DO PRODUTO: ANTI-ALUCINAÇÃO E CONVERSÃO REAL */}
      {/* ============================================================== */}
      <section className="py-20 px-6 border-b border-[#E3DFD6]/60">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Anúncios que vendem a sua verdade.
            </h2>
            <p className="mt-3 text-[#55534E] text-base">
              Anúncios com avatares falsos de IA geram estranheza e derrubam a credibilidade da sua loja. Construímos uma ferramenta focada em estética limpa e conversão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <span className="font-mono text-sm font-bold text-[#FF5A1F]">01</span>
              <div>
                <h4 className="text-lg font-bold text-[#111111] mb-1">Seus Textos e Preços Reais</h4>
                <p className="text-sm text-[#55534E]">
                  Cada linha, condição de entrega e preço vem diretamente da sua peça publicitária. Nada de ofertas inventadas pela IA.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="font-mono text-sm font-bold text-[#FF5A1F]">02</span>
              <div>
                <h4 className="text-lg font-bold text-[#111111] mb-1">Sem Avatares Falsos</h4>
                <p className="text-sm text-[#55534E]">
                  Nenhum rosto falso ou pessoa gerada por IA falando com sotaque robótico. O produto e a oferta são os verdadeiros protagonistas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="font-mono text-sm font-bold text-[#FF5A1F]">03</span>
              <div>
                <h4 className="text-lg font-bold text-[#111111] mb-1">Projetado para Som Ligado ou Mudo</h4>
                <p className="text-sm text-[#55534E]">
                  A maioria das pessoas navega no feed sem áudio. A tipografia cinética garante leitura rápida instantânea, e quem ativa o som ouve a narração fluida.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="font-mono text-sm font-bold text-[#FF5A1F]">04</span>
              <div>
                <h4 className="text-lg font-bold text-[#111111] mb-1">3 Formatos com 1 Clique</h4>
                <p className="text-sm text-[#55534E]">
                  Receba o vídeo em 9:16 (Stories, Reels, TikTok), 4:5 (Feed vertical do Instagram) e 1:1 (Feed quadrado / WhatsApp).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. PREÇOS (ESTILO URL2AD: PAGUE POR ANÚNCIO) */}
      {/* ============================================================== */}
      <section id="precos" className="py-20 px-6 border-b border-[#E3DFD6]/60 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Preço simples. Pague por anúncio.
            </h2>
            <p className="mt-2 text-[#55534E]">Sem assinatura obrigatória. Teste de graça antes de decidir.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl border border-[#E3DFD6] bg-[#F6F4EF] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#111111]">Prévia Gratuita</h3>
                <div className="text-5xl font-black text-[#111111] my-4">R$ 0</div>
                <p className="text-xs text-[#55534E] mb-6">Veja o vídeo pronto antes de qualquer pagamento</p>
                <ul className="space-y-3 text-sm text-[#55534E]">
                  <li className="flex items-center gap-2">✓ Vídeo completo de 15 segundos</li>
                  <li className="flex items-center gap-2">✓ Narração neural inclusa</li>
                  <li className="flex items-center gap-2">✓ Marca d'água de prévia</li>
                  <li className="flex items-center gap-2">✓ Sem necessidade de cartão</li>
                </ul>
              </div>
              <a
                href="#criar"
                className="mt-8 block text-center py-3 rounded-xl border-2 border-[#111111] bg-white font-bold text-sm text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
              >
                Testar com meu Card
              </a>
            </div>

            <div className="p-8 rounded-3xl border-2 border-[#111111] bg-[#111111] text-white flex flex-col justify-between shadow-xl">
              <div>
                <div className="inline-block bg-[#FF5A1F] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full mb-3">
                  Mais Popular
                </div>
                <h3 className="text-xl font-bold text-white">Anúncio Final em HD</h3>
                <div className="text-5xl font-black text-white my-4">
                  R$ 14,90 <span className="text-xs font-semibold text-gray-400">pagamento único</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">Uma vez aprovada a sua prévia</p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2">✓ Sem marca d'água, Full HD 1080p</li>
                  <li className="flex items-center gap-2">✓ 3 formatos inclusos (9:16, 4:5 e 1:1)</li>
                  <li className="flex items-center gap-2">✓ Licença comercial completa</li>
                  <li className="flex items-center gap-2">✓ Pagamento instantâneo via Pix</li>
                </ul>
              </div>
              <a
                href="#criar"
                className="mt-8 block text-center py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#D9420D] font-bold text-sm text-white transition-colors shadow-lg shadow-[#FF5A1F]/30"
              >
                Gerar Meu Anúncio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. FOOTER */}
      {/* ============================================================== */}
      <footer className="py-12 px-6 bg-[#F6F4EF] text-[#55534E] text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#E3DFD6] pt-8">
          <div className="flex items-center gap-2 font-bold text-sm text-[#111111]">
            <span>Card2Ad</span> • Do Card ao Vídeo em 15 Segundos
          </div>
          <div>© {new Date().getFullYear()} Card2Ad. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
