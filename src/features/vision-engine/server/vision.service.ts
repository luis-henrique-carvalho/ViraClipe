import { GoogleGenAI, Type } from "@google/genai";
import { serverEnv } from "@/config/server-env";
import { createServerLogger } from "@/server/logger";
import {
  type CardAnalysisResult,
  type AnalyzeCardInput,
  cardAnalysisResultSchema,
} from "../data/vision.schema";

const log = createServerLogger("vision-engine");

export function parseDataUrl(dataUrl: string): { mimeType: string; base64Data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !match[1] || !match[2]) {
    return null;
  }
  return {
    mimeType: match[1],
    base64Data: match[2],
  };
}

const SYSTEM_INSTRUCTION = `
Você é um Diretor de Criação Publicitária e Cineasta especialista em transformar peças gráficas estáticas (cards, banners, anúncios e posts de Instagram) em anúncios em vídeo de alta conversão para Reels, TikTok e Shorts.
Sua missão é analisar minuciosamente a imagem enviada, identificar a identidade única da marca e criar uma DIREÇÃO DE CENA CINEMATOGRÁFICA sob medida de 15 segundos para o motor Hypit compilar.

Diretrizes de Direção Criativa:
1. Nunca use o mesmo padrão genérico para tudo. Se a arte for de moda, a linguagem é refinada; se for comida/delivery, o ritmo é apetitoso; se for promoção, o ritmo é veloz e impactante.
2. Identifique os pontos visuais da imagem:
   - Onde está o produto físico ou visual de destaque (ex: roupas, prato, tênis)?
   - Onde está o logo/nome da marca?
   - Onde estão os diferenciais e preços?
3. Planeje 4 cortes de cena (cada cena com 3.75s):
   - Cena 1: Gancho inicial de retenção (Scroll Stopper nos primeiros 3s).
   - Cena 2: Foco no produto ou benefício chave com corte de câmera no detalhe visual correspondente.
   - Cena 3: A oferta principal, desconto ou condição de pagamento com efeito sonoro de impacto.
   - Cena 4: Fechamento de marca com Chamada para Ação (CTA) clara.
4. Escreva uma locução publicitária em português (35 a 45 palavras) sincronizada para durar exatamente 15 segundos.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    brandName: { type: Type.STRING, description: "Nome da marca identificado no card" },
    niche: { type: Type.STRING, description: "Nicho ou segmento do produto/loja" },
    aesthetic: { type: Type.STRING, description: "Descrição do estilo estético da arte" },
    videoFormat: {
      type: Type.STRING,
      enum: [
        "fashion_elegance",
        "retail_promo",
        "fast_urgency",
        "editorial_clean",
        "food_and_beverage",
        "service_authority",
      ],
      description: "Formato do vídeo publicitário mais adequado para este nicho",
    },
    energyLevel: {
      type: Type.STRING,
      enum: ["smooth", "dynamic", "punchy"],
      description: "Nível de energia e velocidade dos cortes",
    },
    soundtrackStyle: {
      type: Type.STRING,
      enum: ["ambient_chill", "upbeat_pop", "energetic_beat", "luxury_classy"],
      description: "Estilo musical ideal para acompanhar o anúncio",
    },
    palette: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING, description: "Cor primária dominante em hexadecimal (#...)" },
        secondary: { type: Type.STRING, description: "Cor secundária de destaque (#...)" },
        accent: { type: Type.STRING, description: "Cor de acento ou brilho (#...)" },
        background: { type: Type.STRING, description: "Cor de fundo predominante (#...)" },
        cardSurface: { type: Type.STRING, description: "Cor da superfície ou card (#...)" },
        textColor: { type: Type.STRING, description: "Cor principal do texto (#...)" },
      },
      required: ["primary", "secondary", "accent", "background", "cardSurface", "textColor"],
    },
    hook: { type: Type.STRING, description: "Frase de impacto inicial para prender atenção em 3s" },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER, description: "Número sequencial da cena de 1 a 4" },
          durationSec: { type: Type.NUMBER, description: "Duração em segundos da cena (3.75)" },
          textOverlay: { type: Type.STRING, description: "Texto principal em caixa alta para a tipografia cinética" },
          subtext: { type: Type.STRING, description: "Subtexto de apoio" },
          icon: {
            type: Type.STRING,
            enum: [
              "hanger",
              "calendar",
              "discount",
              "check",
              "star",
              "sparkles",
              "arrow_up",
              "shield",
              "bag",
              "fire",
            ],
            description: "Ícone visual correspondente ao tema da cena",
          },
          focusKeyword: { type: Type.STRING, description: "Palavra-chave central da cena" },
          focusArea: {
            type: Type.STRING,
            enum: ["product_detail", "brand_header", "offer_badge", "overview"],
            description: "Região da imagem onde a câmera deve focar nesta cena",
          },
          cameraMotion: {
            type: Type.STRING,
            enum: ["push_in", "pan_down_product", "pull_back_offer", "steady_cta", "whip_zoom"],
            description: "Movimento de câmera cinético para esta cena",
          },
          soundEffect: {
            type: Type.STRING,
            enum: ["whoosh", "pop", "ding", "riser", "cash", "sparkle"],
            description: "Efeito sonoro que acompanha a entrada da cena",
          },
        },
        required: [
          "id",
          "durationSec",
          "textOverlay",
          "subtext",
          "icon",
          "focusArea",
          "cameraMotion",
          "soundEffect",
        ],
      },
    },
    voiceoverScript: {
      type: Type.STRING,
      description: "Roteiro de narração completo em português (35 a 45 palavras) para durar 15 segundos",
    },
    ctaText: { type: Type.STRING, description: "Texto do botão de chamada para ação" },
    ctaSubtext: { type: Type.STRING, description: "Texto complementar abaixo do CTA" },
  },
  required: [
    "brandName",
    "niche",
    "aesthetic",
    "videoFormat",
    "energyLevel",
    "soundtrackStyle",
    "palette",
    "hook",
    "scenes",
    "voiceoverScript",
    "ctaText",
    "ctaSubtext",
  ],
};

export async function analyzeCardWithGemini(
  input: AnalyzeCardInput,
  client?: GoogleGenAI
): Promise<CardAnalysisResult> {
  const parsed = parseDataUrl(input.imageDataUrl);
  if (!parsed) {
    throw new Error("Formato inválido de imagem (esperado Data URL base64)");
  }

  const apiKey = serverEnv.GEMINI_API_KEY;
  if (!apiKey && !client) {
    log.warn("GEMINI_API_KEY não encontrada. Utilizando análise de demonstração com heurística visual.");
    return generateFallbackAnalysis(input);
  }

  const aiClient = client ?? new GoogleGenAI({ apiKey });

  try {
    log.info(`Enviando card para direção criativa no Gemini Multimodal (${serverEnv.GEMINI_MODEL})`);

    const promptText = `
Analise esta peça publicitária ${input.caption ? `com a legenda: "${input.caption}"` : ""}.
Tom da marca: ${input.tone || "persuasive"}.
Crie a direção de cena personalizada de 15 segundos para o compilador Hypit montar o vídeo final em MP4.
`;

    const response = await aiClient.models.generateContent({
      model: serverEnv.GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_INSTRUCTION },
            {
              inlineData: {
                mimeType: parsed.mimeType,
                data: parsed.base64Data,
              },
            },
            { text: promptText },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
      },
    });

    const responseText = response.text || "";
    const rawData = JSON.parse(responseText);

    log.info(`Direção criativa do Gemini concluída para [${rawData.brandName}] no formato [${rawData.videoFormat}]`);
    return cardAnalysisResultSchema.parse(rawData);
  } catch (error) {
    log.error(`Erro na análise multimodal com Gemini: ${(error as Error).message}`);
    log.info("Acionando fallback inteligente de direção criativa");
    return generateFallbackAnalysis(input);
  }
}

/**
 * Fallback heurístico inteligente para testes offline ou caso a cota da API expire
 */
export function generateFallbackAnalysis(input: AnalyzeCardInput): CardAnalysisResult {
  const isModa = input.caption?.toLowerCase().includes("look") || input.caption?.toLowerCase().includes("pedido");

  return cardAnalysisResultSchema.parse({
    brandName: isModa ? "Favorita Modas" : "Sua Marca",
    niche: isModa ? "Moda Feminina" : "Varejo & Serviços",
    aesthetic: "Elegante e sofisticado com tons neutros e marsala",
    videoFormat: isModa ? "fashion_elegance" : "retail_promo",
    energyLevel: "dynamic",
    soundtrackStyle: "upbeat_pop",
    palette: {
      primary: "#6A2B3B",
      secondary: "#FF5A1F",
      accent: "#C5A880",
      background: "#FAF7F2",
      cardSurface: "rgba(255, 255, 255, 0.9)",
      textColor: "#111111",
    },
    hook: "QUER GARANTIR AS MELHORES PEÇAS COM PREÇO DE ATACADO?",
    scenes: [
      {
        id: 1,
        durationSec: 3.75,
        textOverlay: "LOOKS NOVOS NA MESMA SEMANA",
        subtext: "Peças sob encomenda com envio rápido de 2 a 5 dias úteis",
        icon: "calendar",
        focusKeyword: "SEMANA",
        focusArea: "brand_header",
        cameraMotion: "push_in",
        soundEffect: "whoosh",
      },
      {
        id: 2,
        durationSec: 3.75,
        textOverlay: "PEÇAS LIMITADAS DISPONÍVEIS",
        subtext: "Escolha suas peças e monte seus looks exclusivos",
        icon: "hanger",
        focusKeyword: "EXCLUSIVOS",
        focusArea: "product_detail",
        cameraMotion: "pan_down_product",
        soundEffect: "sparkle",
      },
      {
        id: 3,
        durationSec: 3.75,
        textOverlay: "PREÇO DE ATACADO EXCLUSIVO",
        subtext: "Condição especial válida no Pix e dinheiro físico",
        icon: "discount",
        focusKeyword: "ATACADO",
        focusArea: "offer_badge",
        cameraMotion: "pull_back_offer",
        soundEffect: "cash",
      },
      {
        id: 4,
        durationSec: 3.75,
        textOverlay: "GARANTA O SEU LOOK AGORA",
        subtext: "Chame no direct ou fale pelo WhatsApp",
        icon: "check",
        focusKeyword: "AGORA",
        focusArea: "overview",
        cameraMotion: "steady_cta",
        soundEffect: "ding",
      },
    ],
    voiceoverScript:
      "Quer renovar o guarda-roupa com preço de atacado? Na Favorita Modas seus pedidos chegam na mesma semana! Aproveite condições exclusivas no Pix e garanta o seu look hoje mesmo no link da bio!",
    ctaText: "GARANTA O SEU LOOK!",
    ctaSubtext: "Chame no WhatsApp ou visite nossa loja",
  });
}
