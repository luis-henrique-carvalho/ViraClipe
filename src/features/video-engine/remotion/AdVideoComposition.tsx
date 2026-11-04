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
import { DynamicCamera } from "./DynamicCamera";
import { KineticTypography } from "./KineticTypography";

export const AdVideoComposition: React.FC<AdVideoCompositionProps> = ({
  cardAnalysis,
  backgroundImageUrl,
  audioUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const primaryColor = cardAnalysis.palette.primary || "#8B263E";
  const accentColor = cardAnalysis.palette.secondary || "#E85D04";
  const brandName = cardAnalysis.brandName || "Favorita Modas";

  // Duração de cada cena: 112 frames (~3.75s)
  const SCENE_FRAMES = 112;
  const currentSceneIndex = Math.min(3, Math.floor(frame / SCENE_FRAMES));

  // =========================================================================
  // 1. STORY PROGRESS BARS (4 Segmentos no Topo - Padrão Reels / TikTok)
  // =========================================================================
  const renderProgressBars = () => {
    return (
      <div
        style={{
          position: "absolute",
          top: height * 0.035,
          left: "5%",
          width: "90%",
          display: "flex",
          gap: 6,
          zIndex: 40,
        }}
      >
        {[0, 1, 2, 3].map((sceneIdx) => {
          let fillPct = 0;
          if (frame >= (sceneIdx + 1) * SCENE_FRAMES) {
            fillPct = 100;
          } else if (frame >= sceneIdx * SCENE_FRAMES) {
            fillPct = ((frame - sceneIdx * SCENE_FRAMES) / SCENE_FRAMES) * 100;
          }

          return (
            <div
              key={sceneIdx}
              style={{
                flex: 1,
                height: 4,
                backgroundColor: "rgba(255, 255, 255, 0.28)",
                borderRadius: 999,
                overflow: "hidden",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${fillPct}%`,
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 0 8px rgba(255,255,255,0.8)",
                  borderRadius: 999,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // =========================================================================
  // 2. HEADER ELEGANTE DA MARCA
  // =========================================================================
  const brandHeaderSpring = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050505",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* CÂMERA DINÂMICA COM CORTES E PARALLAX POR CENA */}
      <DynamicCamera imageUrl={backgroundImageUrl} />

      {/* ÁUDIO: Narração Neural Edge-TTS + Trilha Sonora Sutil Ducked */}
      {audioUrl && <Audio src={audioUrl} volume={1.0} />}
      <Audio src="/audio/ambient-beat.mp3" volume={audioUrl ? 0.08 : 0.25} />

      {/* PROGRESS BARS */}
      {renderProgressBars()}

      {/* HEADER FIXO DA MARCA COM BADGE PREMIUM */}
      <div
        style={{
          position: "absolute",
          top: height * 0.055,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 35,
          transform: `translateY(${(1 - brandHeaderSpring) * -30}px)`,
          opacity: brandHeaderSpring,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(10, 10, 10, 0.75)",
            backdropFilter: "blur(18px)",
            border: `1.5px solid ${accentColor}88`,
            padding: "8px 22px",
            borderRadius: 999,
            boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 15px ${accentColor}33`,
          }}
        >
          <span style={{ fontSize: 16 }}>✨</span>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {brandName}
          </span>
          <span
            style={{
              backgroundColor: primaryColor,
              color: "#FFF",
              fontSize: 11,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 999,
              textTransform: "uppercase",
            }}
          >
            Oficial
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CENA 1: O GANCHO DE ATENÇÃO (Frames 0 a 112 / 0s a 3.75s)                 */}
      {/* ========================================================================= */}
      <Sequence from={0} durationInFrames={SCENE_FRAMES}>
        {(() => {
          const sceneFrame = frame;
          const badgeSpring = spring({
            frame: sceneFrame,
            fps,
            config: { damping: 12, mass: 0.6 },
          });

          return (
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 40px",
                zIndex: 30,
              }}
            >
              {/* Badge de Impacto Inicial */}
              <div
                style={{
                  transform: `scale(${badgeSpring}) translateY(${(1 - badgeSpring) * 20}px)`,
                  opacity: badgeSpring,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: primaryColor,
                    color: "#FFFFFF",
                    padding: "8px 20px",
                    borderRadius: 999,
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    boxShadow: `0 6px 20px ${primaryColor}99`,
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <span>🔥</span>
                  <span>Aviso Importante</span>
                </div>
              </div>

              {/* Tipografia Cinética com revelação escalonada de palavras */}
              <KineticTypography
                text={cardAnalysis.hook || "QUER SEUS LOOKS NOVOS AINDA ESTA SEMANA?"}
                fontSize={56}
                delayFrames={6}
                accentColor={accentColor}
                highlightWords={["looks", "semana", "atacado", "preço", "menor"]}
              />
            </AbsoluteFill>
          );
        })()}
      </Sequence>

      {/* ========================================================================= */}
      {/* CENA 2: O BENEFÍCIO / ENVIO RÁPIDO (Frames 112 a 224 / 3.75s a 7.5s)     */}
      {/* ========================================================================= */}
      <Sequence from={SCENE_FRAMES} durationInFrames={SCENE_FRAMES}>
        {(() => {
          const sceneFrame = frame - SCENE_FRAMES;
          const cardSlide = spring({
            frame: sceneFrame,
            fps,
            config: { damping: 14, mass: 0.7, stiffness: 130 },
          });

          const sceneData = cardAnalysis.scenes[1] || {
            textOverlay: "PEÇAS SOB ENCOMENDA COM ENVIO RÁPIDO",
            subtext: "Seus looks chegam na mesma semana do pedido",
          };

          return (
            <AbsoluteFill
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "0 36px 140px 36px",
                zIndex: 30,
              }}
            >
              {/* Card Flutuante de Benefício com Design Editorial */}
              <div
                style={{
                  width: "100%",
                  transform: `translateY(${(1 - cardSlide) * 60}px)`,
                  opacity: cardSlide,
                }}
              >
                {/* Tag de Categoria */}
                <div style={{ marginBottom: 16 }}>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "rgba(0, 0, 0, 0.75)",
                      backdropFilter: "blur(12px)",
                      color: accentColor,
                      border: `1px solid ${accentColor}66`,
                      padding: "6px 16px",
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    📦 Envio Ágil & Direto
                  </span>
                </div>

                {/* Texto Principal Cinético */}
                <KineticTypography
                  text={sceneData.textOverlay}
                  fontSize={44}
                  align="left"
                  delayFrames={0}
                  accentColor={accentColor}
                  highlightWords={["rápido", "mesma", "semana", "encomenda", "2 a 5"]}
                />

                {/* Subtexto com Ícone */}
                {sceneData.subtext && (
                  <div
                    style={{
                      marginTop: 18,
                      backgroundColor: "rgba(15, 15, 15, 0.8)",
                      backdropFilter: "blur(16px)",
                      padding: "14px 20px",
                      borderRadius: 18,
                      borderLeft: `4px solid ${accentColor}`,
                      color: "#E0E0E0",
                      fontSize: 22,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                  >
                    {sceneData.subtext}
                  </div>
                )}
              </div>
            </AbsoluteFill>
          );
        })()}
      </Sequence>

      {/* ========================================================================= */}
      {/* CENA 3: A OFERTA / CONDIÇÃO DE ATACADO (Frames 224 a 336 / 7.5s a 11.25s) */}
      {/* ========================================================================= */}
      <Sequence from={SCENE_FRAMES * 2} durationInFrames={SCENE_FRAMES}>
        {(() => {
          const sceneFrame = frame - SCENE_FRAMES * 2;
          const popSpring = spring({
            frame: sceneFrame,
            fps,
            config: { damping: 11, mass: 0.5, stiffness: 160 },
          });

          const pulseScale = 1 + Math.sin((sceneFrame / 8) * Math.PI) * 0.03;

          const sceneData = cardAnalysis.scenes[2] || {
            textOverlay: "PREÇO DE ATACADO EXCLUSIVO",
            subtext: "Válido para pagamentos no Pix e dinheiro físico",
          };

          return (
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 36px",
                zIndex: 30,
              }}
            >
              {/* Badge Rotacionada de Oferta Explosiva */}
              <div
                style={{
                  transform: `scale(${popSpring * pulseScale}) rotate(-2deg)`,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    backgroundColor: accentColor,
                    color: "#000000",
                    fontWeight: 900,
                    fontSize: 20,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "8px 24px",
                    borderRadius: 14,
                    boxShadow: `0 8px 30px ${accentColor}88`,
                    border: "2px solid #FFFFFF",
                  }}
                >
                  ⚡ CONDIÇÃO ESPECIAL
                </div>
              </div>

              {/* Título de Destaque da Oferta */}
              <KineticTypography
                text={sceneData.textOverlay}
                fontSize={52}
                delayFrames={2}
                accentColor={accentColor}
                highlightWords={["atacado", "exclusivo", "pix", "dinheiro", "promoção"]}
              />

              {/* Selo dos Meios de Pagamento */}
              <div
                style={{
                  marginTop: 26,
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.82)",
                    backdropFilter: "blur(14px)",
                    border: `1.5px solid ${accentColor}`,
                    padding: "14px 18px",
                    borderRadius: 20,
                    color: "#FFFFFF",
                    fontSize: 22,
                    fontWeight: 800,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  }}
                >
                  <span style={{ fontSize: 24 }}>💎</span>
                  <span>PIX</span>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.82)",
                    backdropFilter: "blur(14px)",
                    border: `1.5px solid ${accentColor}`,
                    padding: "14px 18px",
                    borderRadius: 20,
                    color: "#FFFFFF",
                    fontSize: 22,
                    fontWeight: 800,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  }}
                >
                  <span style={{ fontSize: 24 }}>💵</span>
                  <span>DINHEIRO</span>
                </div>
              </div>
            </AbsoluteFill>
          );
        })()}
      </Sequence>

      {/* ========================================================================= */}
      {/* CENA 4: CHAMADA PARA AÇÃO (CTA) (Frames 336 a 450 / 11.25s a 15s)          */}
      {/* ========================================================================= */}
      <Sequence from={SCENE_FRAMES * 3} durationInFrames={SCENE_FRAMES}>
        {(() => {
          const sceneFrame = frame - SCENE_FRAMES * 3;
          const ctaSpring = spring({
            frame: sceneFrame,
            fps,
            config: { damping: 13, mass: 0.7, stiffness: 140 },
          });

          // Efeito de pulso de atenção no botão de ação
          const pulse = 1 + Math.sin((sceneFrame / 6) * Math.PI) * 0.04;

          // Efeito de brilho varrendo o botão
          const sheenPosition = interpolate(sceneFrame, [0, 80], [-100, 200], {
            extrapolateRight: "clamp",
          });

          return (
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 36px",
                zIndex: 30,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  width: "100%",
                  transform: `scale(${ctaSpring}) translateY(${(1 - ctaSpring) * 30}px)`,
                  opacity: ctaSpring,
                }}
              >
                {/* Título de Chamada para Ação */}
                <KineticTypography
                  text={cardAnalysis.ctaText || "GARANTA O SEU LOOK AGORA!"}
                  fontSize={52}
                  delayFrames={0}
                  accentColor={accentColor}
                  highlightWords={["look", "garanta", "agora"]}
                />

                {/* Subtexto */}
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: 24,
                    fontWeight: 600,
                    marginTop: 16,
                    marginBottom: 36,
                    textShadow: "0 4px 14px rgba(0,0,0,0.8)",
                  }}
                >
                  {cardAnalysis.ctaSubtext || "Clique no botão abaixo ou envie uma mensagem"}
                </p>

                {/* Botão de Alta Conversão com Efeito de Brilho (Sheen) */}
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    transform: `scale(${pulse})`,
                    cursor: "pointer",
                    overflow: "hidden",
                    borderRadius: 999,
                    boxShadow: `0 12px 35px ${primaryColor}BB, 0 0 25px ${accentColor}66`,
                  }}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                      color: "#FFFFFF",
                      fontSize: 30,
                      fontWeight: 900,
                      padding: "20px 48px",
                      borderRadius: 999,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      border: "2px solid rgba(255,255,255,0.4)",
                    }}
                  >
                    <span>Fale Conosco</span>
                    <span style={{ fontSize: 32 }}>👉</span>
                  </div>

                  {/* Efeito de Luz Varrendo o Botão */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${sheenPosition}%`,
                      width: "40%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      transform: "skewX(-25deg)",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {/* Indicador de Deslizar / Toque com Animação de Salto */}
                <div
                  style={{
                    marginTop: 32,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 18,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <span>🔗 Link na Bio ou Direct</span>
                </div>
              </div>
            </AbsoluteFill>
          );
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};
