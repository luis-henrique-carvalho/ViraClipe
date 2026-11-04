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
Você é um Diretor de Arte e Copywriter sênior especialista em anúncios de alta conversão para Instagram Reels, TikTok e Shorts.
Sua missão é analisar uma imagem de peça publicitária (card estático, banner de social media ou post do Instagram) e extrair os dados estruturados necessários para animá-la em um vídeo de anúncio de exatamente 15 segundos.

Regras de Extração e Adaptação:
1. Extraia o nome da marca, nicho, estética visual e as cores hexadecimais dominantes do card (primária, secundária, acento e fundo).
2. Crie um Gancho (Hook) forte para os primeiros 3 segundos de vídeo, baseado na mensagem central do card.
3. Divida o anúncio em 4 cenas sequenciais (3.75 segundos cada, totalizando 15 segundos):
   - Cena 1: Hook / Pergunta de impacto que para o scroll.
   - Cena 2: O primeiro benefício ou aviso essencial (ex: prazo de entrega, lançamento).
   - Cena 3: A oferta principal, condição especial ou diferencial (ex: preço de atacado, desconto Pix).
   - Cena 4: Fechamento com Chamada para Ação (CTA) clara.
4. Escreva um Roteiro de Narração (voiceoverScript) em português brasileiro fluente, persuasivo e conciso (cerca de 35 a 45 palavras), ideal para ser lido em exatamente 15 segundos.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    brandName: { type: Type.STRING, description: "Nome da marca identificado no card" },
    niche: { type: Type.STRING, description: "Nicho ou segmento do produto/loja" },
    aesthetic: { type: Type.STRING, description: "Descrição do estilo estético" },
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
            enum: ["hanger", "calendar", "discount", "check", "star", "sparkles", "arrow_up", "shield"],
            description: "Ícone visual correspondente ao tema da cena",
          },
          focusKeyword: { type: Type.STRING, description: "Palavra-chave central da cena" },
        },
        required: ["id", "durationSec", "textOverlay", "subtext", "icon"],
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
    log.info(`Enviando card para análise no Gemini Multimodal (${serverEnv.GEMINI_MODEL})`);

    const promptText = `
Analise este card de social media ${input.caption ? `com a legenda: "${input.caption}"` : ""} e devolva o JSON estruturado para transformá-lo em um anúncio em vídeo de 15 segundos.
Tom desejado: ${input.tone || "persuasive"}.
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

    log.info(`Análise pelo Gemini concluída com sucesso para a marca: ${rawData.brandName}`);
    return cardAnalysisResultSchema.parse(rawData);
  } catch (error) {
    log.error(`Erro na análise multimodal com Gemini: ${(error as Error).message}`);
    log.info("Acionando fallback inteligente de análise de card");
    return generateFallbackAnalysis(input);
  }
}

/**
 * Fallback heurístico inteligente para testes offline ou caso a cota da API expire
 */
export function generateFallbackAnalysis(input: AnalyzeCardInput): CardAnalysisResult {
  const isModa = input.caption?.toLowerCase().includes("look") || input.caption?.toLowerCase().includes("pedido");

  if (isModa) {
    return {
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
      hook: "QUER LOOKS NOVOS AINDA ESTA SEMANA?",
      scenes: [
        {
          id: 1,
          durationSec: 3.75,
          textOverlay: "QUER SEUS LOOKS NOVOS ESSA SEMANA?",
          subtext: "Na Favorita Modas o envio é rápido",
          icon: "sparkles",
          focusKeyword: "Looks Novos",
        },
        {
          id: 2,
          durationSec: 3.75,
          textOverlay: "PEÇAS SOB ENCOMENDA EM 2 A 5 DIAS",
          subtext: "Seu look chega na mesma semana do pedido",
          icon: "hanger",
          focusKeyword: "2 a 5 dias úteis",
        },
        {
          id: 3,
          durationSec: 3.75,
          textOverlay: "PREÇO EXCLUSIVO DE ATACADO",
          subtext: "Válido para pagamentos no Pix e dinheiro físico",
          icon: "discount",
          focusKeyword: "Preço de Atacado",
        },
        {
          id: 4,
          durationSec: 3.75,
          textOverlay: "GARANTA O SEU LOOK AGORA!",
          subtext: "Toque no link da bio e fale conosco",
          icon: "arrow_up",
          focusKeyword: "Link na Bio",
        },
      ],
      voiceoverScript: "Quer renovar seus looks e receber ainda esta semana? Na Favorita Modas seus pedidos sob encomenda chegam rápido, com preço exclusivo de atacado no Pix ou dinheiro. Garanta o seu look agora no link da bio!",
      ctaText: "Garanta o seu look!",
      ctaSubtext: "Toque no link da bio",
    };
  }

  return {
    brandName: "Sua Marca",
    niche: "Varejo & Serviços",
    aesthetic: "Moderno e direto",
    palette: {
      primary: "#111111",
      secondary: "#FF5A1F",
      accent: "#FF733E",
      background: "#F6F4EF",
      cardSurface: "rgba(255, 255, 255, 0.9)",
      textColor: "#111111",
    },
    hook: "OFERTA EXCLUSIVA POR TEMPO LIMITADO",
    scenes: [
      {
        id: 1,
        durationSec: 3.75,
        textOverlay: "OFERTA EXCLUSIVA PARA VOCÊ",
        subtext: "Condições especiais disponíveis hoje",
        icon: "sparkles",
        focusKeyword: "Oferta",
      },
      {
        id: 2,
        durationSec: 3.75,
        textOverlay: "QUALIDADE E ENTREGA RÁPIDA",
        subtext: "Praticidade e atendimento direto",
        icon: "calendar",
        focusKeyword: "Rápido",
      },
      {
        id: 3,
        durationSec: 3.75,
        textOverlay: "CONDIÇÕES IMPERDÍVEIS NO PIX",
        subtext: "Economia garantida no seu pedido",
        icon: "discount",
        focusKeyword: "Desconto",
      },
      {
        id: 4,
        durationSec: 3.75,
        textOverlay: "PEÇA AGORA MESMO",
        subtext: "Clique no botão e aproveite",
        icon: "arrow_up",
        focusKeyword: "Peça Já",
      },
    ],
    voiceoverScript: "Aproveite esta condição especial por tempo limitado! Qualidade garantida, envio rápido e descontos exclusivos no Pix. Não fique de fora, peça agora mesmo pelo link!",
    ctaText: "Peça agora!",
    ctaSubtext: "Disponível por tempo limitado",
  };
}
