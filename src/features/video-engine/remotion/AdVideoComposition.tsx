import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { AdVideoCompositionProps } from "../types";
import { BackgroundMotion } from "./BackgroundMotion";
import { KineticText } from "./KineticText";

export const AdVideoComposition: React.FC<AdVideoCompositionProps> = ({
  cardAnalysis,
  backgroundImageUrl,
  audioUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const primaryColor = cardAnalysis.palette.primary || "#6A2B3B";
  const accentColor = cardAnalysis.palette.secondary || "#C5A880";
  const brandName = cardAnalysis.brandName || "Favorita Modas";

  // Duração de cada cena: 112 frames (~3.75s)
  const SCENE_FRAMES = 112;

  // Animação de transição entre cenas
  const scene1Progress = spring({ frame, fps, config: { damping: 15 } });
  const scene2Frame = frame - SCENE_FRAMES;
  const scene3Frame = frame - SCENE_FRAMES * 2;
  const scene4Frame = frame - SCENE_FRAMES * 3;

  return (
    <AbsoluteFill style={{ backgroundColor: "#111", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      {/* 1. Imagem de Fundo com Movimento Ken Burns */}
      <BackgroundMotion imageUrl={backgroundImageUrl} />

      {/* 2. Áudio da Narração */}
      {audioUrl && <Audio src={audioUrl} volume={1} />}

      {/* 3. Header Fixo com Nome da Marca */}
      <div
        style={{
          position: "absolute",
          top: height * 0.06,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(12px)",
            border: `1.5px solid ${accentColor}`,
            padding: "10px 24px",
            borderRadius: 999,
            color: "#FFF",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          }}
        >
          {brandName}
        </div>
      </div>

      {/* ============================================================== */}
      {/* CENA 1: O GANCHO (0s a 3.75s / Frames 0 a 112) */}
      {/* ============================================================== */}
      <Sequence from={0} durationInFrames={SCENE_FRAMES}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 40px" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: primaryColor,
              color: "#FFF",
              padding: "8px 18px",
              borderRadius: 8,
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            Aviso Importante
          </div>
          <KineticText
            text={cardAnalysis.hook || "QUER SEUS LOOKS NOVOS AINDA ESTA SEMANA?"}
            fontSize={52}
            color="#FFFFFF"
            delayFrames={4}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ============================================================== */}
      {/* CENA 2: PRIMEIRO DESTAQUE / RAPIDEZ (3.75s a 7.5s / Frames 112 a 225) */}
      {/* ============================================================== */}
      <Sequence from={SCENE_FRAMES} durationInFrames={SCENE_FRAMES}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 36px" }}>
          {cardAnalysis.scenes[1] && (
            <div
              style={{
                width: "90%",
                backgroundColor: "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(18px)",
                borderRadius: 28,
                padding: "36px 28px",
                border: `2px solid ${accentColor}`,
                boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 16,
                }}
              >
                👗
              </div>
              <KineticText
                text={cardAnalysis.scenes[1].textOverlay}
                fontSize={38}
                color={primaryColor}
                delayFrames={0}
              />
              {cardAnalysis.scenes[1].subtext && (
                <div
                  style={{
                    fontSize: 24,
                    color: "#4A4A4A",
                    marginTop: 16,
                    fontWeight: 600,
                  }}
                >
                  {cardAnalysis.scenes[1].subtext}
                </div>
              )}
            </div>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* ============================================================== */}
      {/* CENA 3: A OFERTA / ATACADO / PIX (7.5s a 11.25s / Frames 225 a 337) */}
      {/* ============================================================== */}
      <Sequence from={SCENE_FRAMES * 2} durationInFrames={SCENE_FRAMES}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 36px" }}>
          {cardAnalysis.scenes[2] && (
            <div
              style={{
                width: "92%",
                backgroundColor: primaryColor,
                borderRadius: 32,
                padding: "40px 30px",
                border: `2px solid ${accentColor}`,
                boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: accentColor,
                  color: "#111",
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 800,
                  marginBottom: 16,
                  textTransform: "uppercase",
                }}
              >
                Condição Exclusiva
              </div>
              <KineticText
                text={cardAnalysis.scenes[2].textOverlay}
                fontSize={42}
                color="#FFFFFF"
                delayFrames={0}
              />
              {cardAnalysis.scenes[2].subtext && (
                <div
                  style={{
                    fontSize: 24,
                    color: "rgba(255, 255, 255, 0.9)",
                    marginTop: 18,
                    fontWeight: 600,
                  }}
                >
                  {cardAnalysis.scenes[2].subtext}
                </div>
              )}
            </div>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* ============================================================== */}
      {/* CENA 4: CHAMADA PARA AÇÃO (CTA) (11.25s a 15s / Frames 337 a 450) */}
      {/* ============================================================== */}
      <Sequence from={SCENE_FRAMES * 3} durationInFrames={SCENE_FRAMES}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 36px" }}>
          <div
            style={{
              textAlign: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(16px)",
                padding: "36px 24px",
                borderRadius: 30,
                border: `2px solid ${accentColor}`,
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              }}
            >
              <KineticText
                text={cardAnalysis.ctaText || "GARANTA O SEU LOOK!"}
                fontSize={44}
                color={primaryColor}
                delayFrames={0}
              />
              <div
                style={{
                  marginTop: 20,
                  display: "inline-block",
                  backgroundColor: primaryColor,
                  color: "#FFFFFF",
                  fontSize: 26,
                  fontWeight: 800,
                  padding: "16px 36px",
                  borderRadius: 999,
                  boxShadow: `0 8px 24px ${primaryColor}80`,
                }}
              >
                {cardAnalysis.ctaSubtext || "Toque no Link da Bio 👆"}
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Barra de Progresso do Vídeo no Rodapé */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 8,
          width: `${(frame / 450) * 100}%`,
          backgroundColor: accentColor,
          zIndex: 30,
        }}
      />
    </AbsoluteFill>
  );
};
