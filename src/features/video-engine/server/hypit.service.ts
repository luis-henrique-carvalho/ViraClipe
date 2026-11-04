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
 * Constrói o HTML dinâmico que será rasterizado pelo Chrome Headless Shell do Hypit
 */
export function buildHypitHtmlTemplate(
  imageDataUrl: string,
  cardAnalysis: CardAnalysisResult
): string {
  const primaryColor = cardAnalysis.palette.primary || "#733544";
  const accentColor = cardAnalysis.palette.secondary || "#C5A880";
  const brandName = cardAnalysis.brandName || "Favorita Modas";
  const hook = cardAnalysis.hook || "QUER SEUS LOOKS NOVOS AINDA ESTA SEMANA?";
  const ctaText = cardAnalysis.ctaText || "GARANTA O SEU LOOK!";
  const ctaSubtext = cardAnalysis.ctaSubtext || "Chame no direct ou WhatsApp";

  const scene2 = cardAnalysis.scenes[1] || {
    textOverlay: "PEÇAS SOB ENCOMENDA COM ENVIO RÁPIDO",
    subtext: "Seus looks chegam na mesma semana do pedido",
    icon: "hanger",
    focusKeyword: "RÁPIDO",
    focusArea: "product_detail",
  };

  const scene3 = cardAnalysis.scenes[2] || {
    textOverlay: "PREÇO DE ATACADO EXCLUSIVO",
    subtext: "Válido para pagamentos no Pix e dinheiro físico",
    icon: "discount",
    focusKeyword: "ATACADO",
    focusArea: "offer_badge",
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Hypit Ad Frame</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 720px;
      height: 1280px;
      overflow: hidden;
      background-color: #050505;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #FFFFFF;
      position: relative;
      user-select: none;
    }
    #camera-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background-color: #000;
    }
    #card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.92) contrast(1.1);
      transform-origin: center center;
      will-change: transform;
    }
    #vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%);
    }
    #top-gradient {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 28%;
      background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%);
    }
    #bottom-gradient {
      position: absolute;
      bottom: 0; left: 0; width: 100%; height: 35%;
      background: linear-gradient(0deg, rgba(0,0,0,0.92) 0%, transparent 100%);
    }
    #flash {
      position: absolute;
      inset: 0;
      background: #FFFFFF;
      opacity: 0;
      pointer-events: none;
      z-index: 50;
    }
    /* Stories Progress Bars */
    #progress-container {
      position: absolute;
      top: 40px;
      left: 5%;
      width: 90%;
      display: flex;
      gap: 6px;
      z-index: 40;
    }
    .progress-bar {
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.28);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: #FFFFFF;
      box-shadow: 0 0 8px rgba(255,255,255,0.8);
      border-radius: 999px;
    }
    /* Brand Header */
    #brand-header {
      position: absolute;
      top: 68px;
      width: 100%;
      display: flex;
      justifyContent: center;
      z-index: 40;
    }
    #brand-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(10, 10, 10, 0.85);
      border: 1.5px solid ${accentColor}99;
      padding: 8px 24px;
      border-radius: 999px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.7), 0 0 15px ${accentColor}33;
    }
    #brand-name {
      font-size: 19px;
      font-weight: 800;
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
    /* Kinetic Text */
    .kinetic-word {
      display: inline-block;
      margin: 0 6px 8px 6px;
      font-weight: 900;
      letter-spacing: -0.03em;
      text-transform: uppercase;
      text-shadow: 0 6px 20px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.8);
      will-change: transform, opacity;
    }
    .highlight-word {
      color: ${accentColor};
      text-shadow: 0 0 25px ${accentColor}AA, 0 4px 18px rgba(0,0,0,0.9);
    }
    /* Pill Tags */
    .impact-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: ${primaryColor};
      color: #FFF;
      padding: 8px 20px;
      border-radius: 999px;
      font-size: 17px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 6px 20px ${primaryColor}99;
      border: 1px solid rgba(255,255,255,0.3);
      margin-bottom: 24px;
    }
    /* Offer Ribbon */
    .offer-ribbon {
      background: ${accentColor};
      color: #000;
      font-weight: 900;
      font-size: 18px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 8px 22px;
      border-radius: 12px;
      box-shadow: 0 8px 30px ${accentColor}88;
      border: 2px solid #FFF;
      margin-bottom: 20px;
    }
    /* CTA Button */
    .cta-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
      color: #FFF;
      font-size: 26px;
      font-weight: 900;
      padding: 18px 44px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      box-shadow: 0 12px 35px ${primaryColor}BB, 0 0 25px ${accentColor}66;
      border: 2px solid rgba(255,255,255,0.4);
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div id="camera-container">
    <img id="card-image" src="${imageDataUrl}" alt="Card" />
    <div id="vignette"></div>
    <div id="top-gradient"></div>
    <div id="bottom-gradient"></div>
  </div>
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
      <span style="font-size:16px;">✨</span>
      <span id="brand-name">${brandName}</span>
      <span id="brand-badge">Oficial</span>
    </div>
  </div>

  <!-- Scene 1: Hook -->
  <div class="scene" id="scene-0">
    <div class="impact-pill" id="pill-0">🔥 AVISO IMPORTANTE</div>
    <div id="hook-text" style="font-size: 46px; line-height: 1.15;">
      ${hook
        .split(" ")
        .map(
          (w) =>
            `<span class="kinetic-word ${
              w.toLowerCase().includes("look") ||
              w.toLowerCase().includes("semana") ||
              w.toLowerCase().includes("atacado") ||
              w.toLowerCase().includes("preço")
                ? "highlight-word"
                : ""
            }">${w}</span>`
        )
        .join("")}
    </div>
  </div>

  <!-- Scene 2: Product Detail & Feature -->
  <div class="scene" id="scene-1" style="justify-content: flex-end; padding-bottom: 120px;">
    <div style="background: rgba(0,0,0,0.75); border: 1px solid ${accentColor}66; padding: 6px 16px; border-radius: 12px; color: ${accentColor}; font-weight:800; font-size: 15px; margin-bottom: 14px;">
      📦 ENVIO ÁGIL & DIRETO
    </div>
    <div style="font-size: 40px; line-height: 1.18; margin-bottom: 16px;">
      ${scene2.textOverlay}
    </div>
    <div style="background: rgba(15,15,15,0.85); border-left: 4px solid ${accentColor}; padding: 12px 18px; border-radius: 14px; font-size: 20px; color: #E0E0E0; font-weight: 600;">
      ${scene2.subtext || ""}
    </div>
  </div>

  <!-- Scene 3: The Offer -->
  <div class="scene" id="scene-2">
    <div class="offer-ribbon">⚡ CONDIÇÃO ESPECIAL</div>
    <div style="font-size: 48px; line-height: 1.15; margin-bottom: 24px;">
      ${scene3.textOverlay}
    </div>
    <div style="display: flex; gap: 12px; width: 100%;">
      <div style="flex: 1; background: rgba(0,0,0,0.85); border: 1.5px solid ${accentColor}; padding: 12px; border-radius: 18px; font-size: 20px; font-weight: 800;">
        💎 PIX
      </div>
      <div style="flex: 1; background: rgba(0,0,0,0.85); border: 1.5px solid ${accentColor}; padding: 12px; border-radius: 18px; font-size: 20px; font-weight: 800;">
        💵 DINHEIRO
      </div>
    </div>
  </div>

  <!-- Scene 4: CTA -->
  <div class="scene" id="scene-3">
    <div style="font-size: 46px; line-height: 1.15; margin-bottom: 14px;">
      ${ctaText}
    </div>
    <div style="color: rgba(255,255,255,0.85); font-size: 20px; font-weight: 600; margin-bottom: 24px;">
      ${ctaSubtext}
    </div>
    <div class="cta-btn" id="cta-btn">
      <span>Fale Conosco</span>
      <span>👉</span>
    </div>
    <div style="margin-top: 24px; color: rgba(255,255,255,0.7); font-size: 16px; font-weight: 700; text-transform: uppercase;">
      🔗 Link na Bio ou Direct
    </div>
  </div>

  <script>
    const SCENE_FRAMES = 112;
    const TOTAL_FRAMES = 450;
    const cardImg = document.getElementById('card-image');
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

    // Função frame a frame chamada pelo Hypit Chrome Shell
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

      // 3. Câmera Dinâmica e Enquadramentos por Cena
      let scale = 1.0;
      let tx = 0;
      let ty = 0;

      if (sceneIdx === 0) {
        // Cena 1: Push-in no topo/marca
        const p = sceneFrame / SCENE_FRAMES;
        scale = 1.05 + p * 0.22;
        ty = -p * 25;
      } else if (sceneIdx === 1) {
        // Cena 2: Pan focado nos produtos / arara de roupas
        const p = sceneFrame / SCENE_FRAMES;
        scale = 1.35 + p * 0.15;
        ty = -150 - p * 35;
        tx = -10 + p * 20;
      } else if (sceneIdx === 2) {
        // Cena 3: Pull-back dinâmico para a oferta
        const p = sceneFrame / SCENE_FRAMES;
        scale = 1.45 - p * 0.22;
        ty = -50 + p * 30;
      } else {
        // Cena 4: CTA estabilizado com respiração
        const p = sceneFrame / SCENE_FRAMES;
        scale = 1.15 - p * 0.05;
        ty = -15 + p * 10;
        // Pulso suave do botão de CTA
        const pulse = 1 + Math.sin(sceneFrame * 0.4) * 0.035;
        if (ctaBtn) ctaBtn.style.transform = 'scale(' + pulse + ')';
      }

      cardImg.style.transform = 'scale(' + scale + ') translate(' + tx + 'px, ' + ty + 'px)';

      // 4. Flash sutil de corte de cena (primeiros 3 frames de cada corte)
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

  log.info(`Iniciando compilação de vídeo MP4 via Hypit Engine para: [${input.cardAnalysis.brandName}]`);

  // 1. Gera o template HTML dinâmico guiado pelo Gemini
  const htmlContent = buildHypitHtmlTemplate(input.imageDataUrl, input.cardAnalysis);

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

  ffmpeg.stderr.on("data", (data) => {
    // Debug output if needed
  });

  // 5. Itera 450 frames (15 segundos a 30 FPS)
  const TOTAL_FRAMES = 450;
  log.info(`Renderizando ${TOTAL_FRAMES} frames com o Chrome Headless Shell do Hypit...`);

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
