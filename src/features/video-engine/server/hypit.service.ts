import path from "node:path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServerLogger } from "@/server/logger";
import type { CardAnalysisResult } from "@/features/vision-engine/data/vision.schema";

const log = createServerLogger("hypit-compiler");

const CHROME_PATH =
  "/home/luis/.cache/hypit/html-rasterizer/chrome/chrome-headless-shell/linux-152.0.7928.2/chrome-headless-shell-linux64/chrome-headless-shell";
const FFMPEG_PATH = "/home/luis/.local/bin/ffmpeg";
const PUPPETEER_PATH =
  "/home/luis/repositories/hypit/node_modules/.pnpm/puppeteer-core@25.10.0/node_modules/puppeteer-core";

const VIDEO_DIR = path.resolve(process.cwd(), "public/video");

export async function ensureVideoDirectory(): Promise<string> {
  await fs.mkdir(VIDEO_DIR, { recursive: true });
  return VIDEO_DIR;
}

export interface CompileVideoInput {
  imageDataUrl: string;
  audioUrl?: string;
  cardAnalysis: CardAnalysisResult;
}

export interface CompileVideoResult {
  videoUrl: string;
  durationSec: number;
  fileSizeBytes: number;
  format: "mp4";
  resolution: "720x1280";
}

/**
 * Constrói o HTML de Motion Graphics criado 100% DO ZERO pelo Hypit.
 * A imagem original NÃO É USADA como plano de fundo.
 * O vídeo é desenhado do zero usando a identidade, cores, marca e roteiro extraídos pelo Gemini.
 */
export function buildHypitHtmlTemplate(
  cardAnalysis: CardAnalysisResult
): string {
  const primaryColor = cardAnalysis.palette.primary || "#FF5A1F";
  const accentColor = cardAnalysis.palette.secondary || "#C5A880";
  const brandName = cardAnalysis.brandName || "Sua Marca";
  const hook = cardAnalysis.hook || "SUA PROMOÇÃO PRONTA ANTES DE ABRIR A LOJA!";
  const ctaText = cardAnalysis.ctaText || "GARANTA O SEU AGORA!";
  const ctaSubtext = cardAnalysis.ctaSubtext || "Chame no direct ou WhatsApp";

  const scene2 = cardAnalysis.scenes[1] || {
    textOverlay: "CARDÁPIO E OFERTAS DO DIA ATUALIZADOS",
    subtext: "Receba pedidos direto no seu WhatsApp sem complicações",
    icon: "hanger",
    focusKeyword: "RÁPIDO",
  };

  const scene3 = cardAnalysis.scenes[2] || {
    textOverlay: "PEÇA PELO WHATSAPP COM CONDIÇÕES ESPECIAIS",
    subtext: "Atendimento direto e prático para o seu pedido",
    icon: "discount",
    focusKeyword: "ATACADO",
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Hypit Clean Motion Graphics</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 720px;
      height: 1280px;
      overflow: hidden;
      background-color: #0A0A0F;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #FFFFFF;
      position: relative;
      user-select: none;
    }
    /* Dynamic Brand Background Orbs (Zero static image) */
    #motion-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 25%, ${primaryColor}44 0%, transparent 60%),
                  radial-gradient(circle at 75% 70%, ${accentColor}33 0%, transparent 65%),
                  #0A0A10;
      transition: background 0.1s ease;
    }
    #vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 100%);
    }
    #flash {
      position: absolute;
      inset: 0;
      background: #FFFFFF;
      opacity: 0;
      pointer-events: none;
      z-index: 60;
    }
    /* Stories Progress Bars */
    #progress-container {
      position: absolute;
      top: 42px;
      left: 6%;
      width: 88%;
      display: flex;
      gap: 6px;
      z-index: 50;
    }
    .progress-bar {
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: #FFFFFF;
      box-shadow: 0 0 10px rgba(255,255,255,0.9);
      border-radius: 999px;
    }
    /* Brand Header */
    #brand-header {
      position: absolute;
      top: 72px;
      width: 100%;
      display: flex;
      justifyContent: center;
      z-index: 45;
    }
    #brand-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(18, 18, 24, 0.88);
      border: 1.5px solid ${primaryColor}88;
      padding: 8px 24px;
      border-radius: 999px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.7), 0 0 20px ${primaryColor}33;
    }
    #brand-name {
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #FFFFFF;
    }
    #brand-badge {
      background: ${primaryColor};
      color: #FFF;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 999px;
      text-transform: uppercase;
    }
    /* Scene Containers */
    .scene {
      position: absolute;
      inset: 0;
      display: none;
      flex-direction: column;
      justifyContent: center;
      align-items: center;
      padding: 0 44px;
      z-index: 30;
      text-align: center;
    }
    /* Kinetic Words */
    .kinetic-word {
      display: inline-block;
      margin: 0 6px 8px 6px;
      font-weight: 900;
      letter-spacing: -0.03em;
      text-transform: uppercase;
      text-shadow: 0 6px 20px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.8);
    }
    .highlight-word {
      color: ${accentColor};
      text-shadow: 0 0 25px ${accentColor}AA, 0 4px 18px rgba(0,0,0,0.9);
    }
    .impact-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
      color: #FFF;
      padding: 10px 24px;
      border-radius: 999px;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 8px 25px ${primaryColor}88;
      border: 1px solid rgba(255,255,255,0.4);
      margin-bottom: 28px;
    }
    .feature-card {
      width: 100%;
      background: rgba(20, 20, 28, 0.9);
      border: 2px solid ${primaryColor}77;
      border-radius: 32px;
      padding: 40px 32px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 30px ${primaryColor}22;
    }
    .offer-ribbon {
      background: ${accentColor};
      color: #0A0A0F;
      font-weight: 900;
      font-size: 22px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 10px 28px;
      border-radius: 16px;
      box-shadow: 0 10px 35px ${accentColor}88;
      border: 2px solid #FFF;
      margin-bottom: 24px;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
      color: #FFF;
      font-size: 28px;
      font-weight: 900;
      padding: 20px 48px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      box-shadow: 0 14px 40px ${primaryColor}AA, 0 0 30px ${accentColor}66;
      border: 2px solid rgba(255,255,255,0.45);
      margin-top: 26px;
    }
  </style>
</head>
<body>
  <!-- Clean Animated Canvas (No user image background!) -->
  <div id="motion-bg"></div>
  <div id="vignette"></div>
  <div id="flash"></div>

  <!-- Story Progress Bars -->
  <div id="progress-container">
    <div class="progress-bar"><div class="progress-fill" id="fill-0"></div></div>
    <div class="progress-bar"><div class="progress-fill" id="fill-1"></div></div>
    <div class="progress-bar"><div class="progress-fill" id="fill-2"></div></div>
    <div class="progress-bar"><div class="progress-fill" id="fill-3"></div></div>
  </div>

  <!-- Brand Header -->
  <div id="brand-header">
    <div id="brand-pill">
      <span style="font-size:16px;">🚀</span>
      <span id="brand-name">${brandName}</span>
      <span id="brand-badge">Oficial</span>
    </div>
  </div>

  <!-- Scene 1: Hook -->
  <div class="scene" id="scene-0">
    <div class="impact-pill">⚡ AVISO IMPORTANTE</div>
    <div style="font-size: 52px; line-height: 1.15;">
      ${hook
        .split(" ")
        .map(
          (w) =>
            `<span class="kinetic-word ${
              w.toLowerCase().includes("pronta") ||
              w.toLowerCase().includes("promoção") ||
              w.toLowerCase().includes("loja") ||
              w.toLowerCase().includes("abrir") ||
              w.toLowerCase().includes("look")
                ? "highlight-word"
                : ""
            }">${w}</span>`
        )
        .join("")}
    </div>
  </div>

  <!-- Scene 2: Feature / Benefit Card -->
  <div class="scene" id="scene-1">
    <div class="feature-card">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:68px; height:68px; border-radius:20px; background:linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); font-size:32px; margin-bottom:18px;">
        ✨
      </div>
      <div style="font-size: 42px; line-height: 1.18; margin-bottom: 18px; font-weight:900;">
        ${scene2.textOverlay}
      </div>
      <div style="color: #D0D0D8; font-size: 22px; font-weight: 600; line-height: 1.35;">
        ${scene2.subtext || ""}
      </div>
    </div>
  </div>

  <!-- Scene 3: The Offer -->
  <div class="scene" id="scene-2">
    <div class="offer-ribbon">🔥 CONDIÇÃO EXCLUSIVA</div>
    <div style="font-size: 48px; line-height: 1.15; margin-bottom: 26px; font-weight:900;">
      ${scene3.textOverlay}
    </div>
    <div style="display: flex; gap: 14px; width: 100%;">
      <div style="flex: 1; background: rgba(22,22,30,0.9); border: 1.5px solid ${accentColor}; padding: 16px; border-radius: 20px; font-size: 22px; font-weight: 800;">
        📲 WHATSAPP
      </div>
      <div style="flex: 1; background: rgba(22,22,30,0.9); border: 1.5px solid ${primaryColor}; padding: 16px; border-radius: 20px; font-size: 22px; font-weight: 800;">
        ⚡ PEDIDO RÁPIDO
      </div>
    </div>
  </div>

  <!-- Scene 4: CTA -->
  <div class="scene" id="scene-3">
    <div style="font-size: 48px; line-height: 1.15; margin-bottom: 16px; font-weight:900;">
      ${ctaText}
    </div>
    <div style="color: rgba(255,255,255,0.85); font-size: 22px; font-weight: 600; margin-bottom: 26px;">
      ${ctaSubtext}
    </div>
    <div class="cta-btn" id="cta-btn">
      <span>Fale Conosco</span>
      <span>👉</span>
    </div>
    <div style="margin-top: 30px; color: rgba(255,255,255,0.7); font-size: 18px; font-weight: 800; text-transform: uppercase;">
      🔗 Link na Bio ou Direct
    </div>
  </div>

  <script>
    const SCENE_FRAMES = 112;
    const TOTAL_FRAMES = 450;
    const bgEl = document.getElementById('motion-bg');
    const flashEl = document.getElementById('flash');
    const scenes = [
      document.getElementById('scene-0'),
      document.getElementById('scene-1'),
      document.getElementById('scene-2'),
      document.getElementById('scene-3'),
    ];
    const fills = [
      document.getElementById('fill-0'),
      document.getElementById('fill-1'),
      document.getElementById('fill-2'),
      document.getElementById('fill-3'),
    ];
    const ctaBtn = document.getElementById('cta-btn');

    window.setFrame = function(frame) {
      const sceneIdx = Math.min(3, Math.floor(frame / SCENE_FRAMES));
      const sceneFrame = frame % SCENE_FRAMES;

      // 1. Alterna cena visível
      scenes.forEach((s, idx) => {
        s.style.display = idx === sceneIdx ? 'flex' : 'none';
      });

      // 2. Preenche barras de progresso estilo stories
      fills.forEach((fill, idx) => {
        if (frame >= (idx + 1) * SCENE_FRAMES) {
          fill.style.width = '100%';
        } else if (frame >= idx * SCENE_FRAMES) {
          fill.style.width = ((frame - idx * SCENE_FRAMES) / SCENE_FRAMES * 100) + '%';
        } else {
          fill.style.width = '0%';
        }
      });

      // 3. Animação suave do fundo de orbs gerado do zero
      const orbX = 25 + Math.sin(frame * 0.03) * 30;
      const orbY = 30 + Math.cos(frame * 0.02) * 25;
      bgEl.style.background = 'radial-gradient(circle at ' + orbX + '% ' + orbY + '%, ${primaryColor}44 0%, transparent 60%), radial-gradient(circle at ' + (100 - orbX) + '% ' + (100 - orbY) + '%, ${accentColor}33 0%, transparent 65%), #0A0A10';

      // 4. Pulso suave do botão na cena 4
      if (sceneIdx === 3 && ctaBtn) {
        const pulse = 1 + Math.sin(sceneFrame * 0.35) * 0.04;
        ctaBtn.style.transform = 'scale(' + pulse + ')';
      }

      // 5. Flash sutil de corte de cena
      if (sceneFrame < 3 && frame > 3) {
        flashEl.style.opacity = (1 - sceneFrame / 3) * 0.45;
      } else {
        flashEl.style.opacity = 0;
      }
    };
  </script>
</body>
</html>`;
}

/**
 * Compila o anúncio dinâmico para um arquivo MP4 real usando o runtime local do Hypit
 */
export async function compileHypitVideo(
  input: CompileVideoInput
): Promise<CompileVideoResult> {
  await ensureVideoDirectory();

  const id = `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const outputFileName = `${id}.mp4`;
  const outputPath = path.join(VIDEO_DIR, outputFileName);

  log.info(`Iniciando compilação de vídeo MP4 via Hypit Engine (criado do zero) para: [${input.cardAnalysis.brandName}]`);

  // 1. Gera o template HTML de Motion Graphics criado 100% do zero (sem usar a imagem como fundo)
  const htmlContent = buildHypitHtmlTemplate(input.cardAnalysis);

  // 2. Carrega puppeteer-core do Hypit
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const puppeteer = require(PUPPETEER_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-audio-output",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 720, height: 1280 });
  await page.setContent(htmlContent, { waitUntil: "load" });

  // 3. Resolve os caminhos dos áudios
  const ambientMusicPath = path.resolve(process.cwd(), "public/audio/ambient-beat.mp3");
  const voiceoverPath = input.audioUrl
    ? path.resolve(process.cwd(), `public${input.audioUrl}`)
    : null;

  // 4. Spawna FFmpeg para receber os frames via stdin pipe
  const ffmpegArgs = [
    "-f",
    "image2pipe",
    "-vcodec",
    "mjpeg",
    "-r",
    "30",
    "-i",
    "-",
  ];

  if (voiceoverPath) {
    ffmpegArgs.push("-i", voiceoverPath);
    ffmpegArgs.push("-i", ambientMusicPath);
    // Mixa locução (100% volume) com trilha ambiente ducked (10% volume)
    ffmpegArgs.push(
      "-filter_complex",
      "[1:a]volume=1.0[v];[2:a]volume=0.12[b];[v][b]amix=inputs=2:duration=first[aout]",
      "-map",
      "0:v",
      "-map",
      "[aout]"
    );
  } else {
    ffmpegArgs.push("-i", ambientMusicPath);
    ffmpegArgs.push("-map", "0:v", "-map", "1:a");
  }

  ffmpegArgs.push(
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "veryfast",
    "-t",
    "15",
    "-y",
    outputPath
  );

  const ffmpeg = spawn(FFMPEG_PATH, ffmpegArgs);

  // 5. Itera 450 frames (15 segundos a 30 FPS)
  const TOTAL_FRAMES = 450;
  log.info(`Renderizando ${TOTAL_FRAMES} frames de Motion Graphics limpo com o Chrome Headless Shell do Hypit...`);

  try {
    for (let f = 0; f < TOTAL_FRAMES; f++) {
      await page.evaluate((frameNum: number) => {
        // @ts-ignore
        if (window.setFrame) window.setFrame(frameNum);
      }, f);

      const frameBuffer = await page.screenshot({
        type: "jpeg",
        quality: 75,
      });

      if (!ffmpeg.stdin.write(frameBuffer)) {
        await new Promise((res) => ffmpeg.stdin.once("drain", res));
      }
    }

    ffmpeg.stdin.end();

    await new Promise<void>((resolve, reject) => {
      ffmpeg.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg falhou com código de saída: ${code}`));
      });
      ffmpeg.on("error", reject);
    });
  } finally {
    await browser.close();
  }

  const stats = await fs.stat(outputPath);
  log.info(`Vídeo MP4 compilado com sucesso pelo Hypit: ${outputFileName} (${stats.size} bytes)`);

  return {
    videoUrl: `/video/${outputFileName}`,
    durationSec: 15,
    fileSizeBytes: stats.size,
    format: "mp4",
    resolution: "720x1280",
  };
}
