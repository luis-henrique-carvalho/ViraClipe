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
  Film,
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
  videoFormat: "fashion_elegance",
  energyLevel: "dynamic",
  soundtrackStyle: "upbeat_pop",
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
      focusKeyword: "SEMANA",
      focusArea: "brand_header",
      cameraMotion: "push_in",
      soundEffect: "whoosh",
    },
    {
      id: 2,
      durationSec: 3.75,
      textOverlay: "PEÇAS SOB ENCOMENDA EM 2 A 5 DIAS",
      subtext: "Seu look chega na mesma semana do pedido",
      icon: "hanger",
      focusKeyword: "RÁPIDO",
      focusArea: "product_detail",
      cameraMotion: "pan_down_product",
      soundEffect: "sparkle",
    },
    {
      id: 3,
      durationSec: 3.75,
      textOverlay: "PREÇO EXCLUSIVO DE ATACADO",
      subtext: "Válido para pagamentos no Pix e dinheiro físico",
      icon: "discount",
      focusKeyword: "ATACADO",
      focusArea: "offer_badge",
      cameraMotion: "pull_back_offer",
      soundEffect: "cash",
    },
    {
      id: 4,
      durationSec: 3.75,
      textOverlay: "GARANTA O SEU LOOK AGORA!",
      subtext: "Toque no link da bio e fale conosco",
      icon: "arrow_up",
      focusKeyword: "AGORA",
      focusArea: "overview",
      cameraMotion: "steady_cta",
      soundEffect: "ding",
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
    videoUrl: undefined as string | undefined,
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

  // Pipeline: Executa a Visão IA + Narração Neural + Compilação Hypit
  const generateVideoFromCard = async (imageDataUrl: string, caption?: string) => {
    setIsLoading(true);
    setStatusMessage("Analisando peça com Gemini e compilando vídeo no Hypit...");
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
        videoUrl: result.videoUrl,
      });

      setStatusMessage("Vídeo cinematográfico compilado com sucesso!");
    } catch (err) {
      console.error(err);
      setStatusMessage("Erro na compilação. Usando versão de prévia.");
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
              Transforme cards de redes sociais, banners estáticos ou posts do seu Instagram em
              anúncios em vídeo de 15 segundos prontos para converter no Reels e TikTok.
            </p>

            {/* Abas: Upload Direto vs Perfil do Instagram */}
            <div className="w-full bg-white p-2 rounded-2xl border border-[#E3DFD6] shadow-sm">
              <div className="flex gap-2 p-1 bg-[#F4F1EA] rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-white text-[#111111] shadow-sm"
                      : "text-[#77746D] hover:text-[#111111]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload da Imagem / Card
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("instagram")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "instagram"
                      ? "bg-white text-[#111111] shadow-sm"
                      : "text-[#77746D] hover:text-[#111111]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Buscar Perfil do Instagram
                  </span>
                </button>
              </div>

              {/* Conteúdo Aba 1: Upload */}
              {activeTab === "upload" && (
                <div className="space-y-4 p-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#DCD7CE] hover:border-[#FF5A1F] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#FAF8F5]">
                    <Upload className="w-8 h-8 text-[#FF5A1F] mb-2" />
                    <span className="text-sm font-bold text-[#111111]">
                      Clique para enviar um card ou banner
                    </span>
                    <span className="text-xs text-[#77746D] mt-1">PNG, JPG, WEBP até 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              )}

              {/* Conteúdo Aba 2: Instagram */}
              {activeTab === "instagram" && (
                <div className="space-y-4 p-2">
                  <form onSubmit={handleFetchInstagram} className="flex gap-2">
                    <Input
                      placeholder="Ex: @favoritamodas ou https://instagram.com/favoritamodas"
                      value={igHandle}
                      onChange={(e) => setIgHandle(e.target.value)}
                      className="rounded-xl border-[#DCD7CE] bg-[#FAF8F5]"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#111111] hover:bg-[#222] text-white rounded-xl px-5 cursor-pointer font-bold shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar Posts"}
                    </Button>
                  </form>

                  {/* Grid de Posts do Instagram */}
                  {igPosts.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4 max-h-56 overflow-y-auto p-1">
                      {igPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => generateVideoFromCard(post.imageUrl, post.caption)}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-[#DCD7CE] cursor-pointer hover:border-[#FF5A1F] transition-all"
                        >
                          <img
                            src={post.imageUrl}
                            alt="Post"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold uppercase text-center p-1">
                            Criar Anúncio
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Opções de Voz da Narração Neural */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E3DFD6] px-2">
                <span className="text-xs text-[#55534E] flex items-center gap-1.5 font-semibold">
                  <Volume2 className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  Voz do Locutor:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVoice("pt-BR-FranciscaNeural")}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                      selectedVoice === "pt-BR-FranciscaNeural"
                        ? "bg-[#111] text-white"
                        : "bg-[#F4F1EA] text-[#55534E]"
                    }`}
                  >
                    Francisca (Feminina)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVoice("pt-BR-AntonioNeural")}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                      selectedVoice === "pt-BR-AntonioNeural"
                        ? "bg-[#111] text-white"
                        : "bg-[#F4F1EA] text-[#55534E]"
                    }`}
                  >
                    Antônio (Masculino)
                  </button>
                </div>
              </div>

              {/* Mensagem de Status */}
              {statusMessage && (
                <div className="mt-3 p-2.5 rounded-xl bg-[#FFF5EF] text-[#D9420D] text-xs font-semibold flex items-center gap-2">
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            {/* Badges de Confiança */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#77746D]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                15 segundos exatos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                Câmera dinâmica por cena
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                Narração em português brasileiro
              </span>
            </div>
          </div>

          {/* Lado Direito: Preview do Vídeo no Smartphone */}
          <div className="lg:col-span-5 flex justify-center">
            <AdVideoPlayer props={videoProps} />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. COMO FUNCIONA (Passo a Passo inspirado no URL2Ad)          */}
      {/* ============================================================== */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-[#111111] tracking-tight">
            Como funciona a transformação
          </h2>
          <p className="text-sm text-[#55534E] mt-3">
            O pipeline autônomo analisa a arte estática e gera um anúncio em vídeo completo em 3 passos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border border-[#E3DFD6] rounded-2xl bg-white shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-[#FFE6DB] text-[#FF5A1F] flex items-center justify-center font-black text-lg mb-4">
              01
            </div>
            <h3 className="font-bold text-lg text-[#111111] mb-2">Visão Computacional & IA</h3>
            <p className="text-sm text-[#55534E] leading-relaxed">
              O Gemini analisa a peça, extrai a paleta de cores, nome da marca e identifica os pontos centrais da oferta.
            </p>
          </Card>

          <Card className="border border-[#E3DFD6] rounded-2xl bg-white shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-[#FFE6DB] text-[#FF5A1F] flex items-center justify-center font-black text-lg mb-4">
              02
            </div>
            <h3 className="font-bold text-lg text-[#111111] mb-2">Roteiro & Locução Neural</h3>
            <p className="text-sm text-[#55534E] leading-relaxed">
              Um copywriter IA escreve o roteiro com gancho de 3s e gera a locução com voz neural humana em português.
            </p>
          </Card>

          <Card className="border border-[#E3DFD6] rounded-2xl bg-white shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-[#FFE6DB] text-[#FF5A1F] flex items-center justify-center font-black text-lg mb-4">
              03
            </div>
            <h3 className="font-bold text-lg text-[#111111] mb-2">Compilação Hypit & Vídeo MP4</h3>
            <p className="text-sm text-[#55534E] leading-relaxed">
              O motor Hypit comanda cortes de câmera, tipografia cinética, barra de stories e renderiza o arquivo MP4 pronto.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
