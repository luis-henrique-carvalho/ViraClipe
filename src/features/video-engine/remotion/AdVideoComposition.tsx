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
import { KineticTypography } from "./KineticTypography";

export const AdVideoComposition: React.FC<AdVideoCompositionProps> = ({
  cardAnalysis,
  audioUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const primaryColor = cardAnalysis.palette.primary || "#FF5A1F";
  const secondaryColor = cardAnalysis.palette.secondary || "#111111";
  const accentColor = cardAnalysis.palette.accent || "#FF8A50";
  const bgColor = cardAnalysis.palette.background || "#0D0D12";
  const brandName = cardAnalysis.brandName || "Sua Marca";

  // Duração de cada cena: 112 frames (~3.75s)
  const SCENE_FRAMES = 112;
  const currentSceneIndex = Math.min(3, Math.floor(frame / SCENE_FRAMES));
  const sceneFrame = frame % SCENE_FRAMES;

  // =========================================================================
  // 1. FUNDO CRIADO DO ZERO (Zero imagem original, puro Motion Graphics)
  // =========================================================================
  // Esferas de luz e gradientes que se movem de acordo com a paleta da marca
  const orb1X = interpolate(frame, [0, 450], [20, 80], { extrapolateRight: "clamp" });
  const orb1Y = interpolate(frame, [0, 450], [15, 45], { extrapolateRight: "clamp" });
  const orb2X = interpolate(frame, [0, 450], [80, 25], { extrapolateRight: "clamp" });
  const orb2Y = interpolate(frame, [0, 450], [75, 60], { extrapolateRight: "clamp" });

  // Transição rápida de luz entre as cenas
  const isTransition = sceneFrame < 4 && frame > 4;
  const flashOpacity = isTransition ? interpolate(sceneFrame, [0, 3], [0.4, 0]) : 0;

  // =========================================================================
  // 2. STORY PROGRESS BARS NO TOPO
  // =========================================================================
  const renderProgressBars = () => {
    return (
      <div
        style={{
          position: "absolute",
          top: height * 0.035,
          left: "6%",
          width: "88%",
          display: "flex",
          gap: 6,
          zIndex: 50,
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
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                borderRadius: 999,
                overflow: "hidden",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${fillPct}%`,
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 0 10px rgba(255,255,255,0.9)",
                  borderRadius: 999,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Header da marca
  const headerSpring = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0C10",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ========================================================================= */}
      {/* CENÁRIO GRÁFICO DINÂMICO GERADO DO ZERO (Canvas Limpo com Orbs e Grid)     */}
      {/* ========================================================================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${orb1X}% ${orb1Y}%, ${primaryColor}44 0%, transparent 55%), radial-gradient(circle at ${orb2X}% ${orb2Y}%, ${accentColor}33 0%, transparent 60%), #0A0A0F`,
        }}
      />

      {/* Grid de perspectiva sutil no rodapé */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "45%",
          background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* Flash de corte de cena */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFFFFF",
            opacity: flashOpacity,
            zIndex: 60,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ÁUDIO: Narração Neural + Trilha Ambiente */}
      {audioUrl && <Audio src={audioUrl} volume={1.0} />}
      <Audio src="/audio/ambient-beat.mp3" volume={audioUrl ? 0.10 : 0.30} />

      {/* BARRAS DE STORIES NO TOPO */}
      {renderProgressBars()}

      {/* HEADER DA MARCA COM BADGE */}
      <div
        style={{
          position: "absolute",
          top: height * 0.055,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 45,
          transform: `translateY(${(1 - headerSpring) * -30}px)`,
          opacity: headerSpring,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(18, 18, 24, 0.85)",
            backdropFilter: "blur(20px)",
            border: `1.5px solid ${primaryColor}77`,
            padding: "8px 24px",
            borderRadius: 999,
            boxShadow: `0 8px 30px rgba(0,0,0,0.7), 0 0 20px ${primaryColor}33`,
          }}
        >
          <span style={{ fontSize: 16 }}>🚀</span>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 900,
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
      {/* CENA 1: O GANCHO DE ATENÇÃO (0s a 3.75s / Frames 0 a 112)                 */}
      {/* ========================================================================= */}
      <Sequence from={0} durationInFrames={SCENE_FRAMES}>
        {(() => {
          const sFrame = frame;
          const springEntrance = spring({
            frame: sFrame,
            fps,
            config: { damping: 12, mass: 0.6, stiffness: 140 },
          });

          return (
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 44px",
                zIndex: 30,
              }}
            >
              {/* Badge de Alerta Inicial */}
              <div
                style={{
                  transform: `scale(${springEntrance}) translateY(${(1 - springEntrance) * 30}px)`,
                  opacity: springEntrance,
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                    color: "#FFFFFF",
                    padding: "10px 24px",
                    borderRadius: 999,
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    boxShadow: `0 8px 25px ${primaryColor}88`,
                    border: "1px solid rgba(255,255,255,0.4)",
                  }}
                >
                  <span>⚡</span>
                  <span>Aviso Importante</span>
                </div>
              </div>

              {/* Título de Gancho em Tipografia Cinética */}
              <KineticTypography
                text={cardAnalysis.hook || "SUA PROMOÇÃO PRONTA ANTES DE ABRIR A LOJA!"}
                fontSize={56}
                delayFrames={4}
                accentColor={accentColor}
                highlightWords={["loja", "pronta", "promoção", "almoço", "dia", "abrir", "looks"]}
              />

              {/* Linha decorativa animada */}
              <div
                style={{
                  marginTop: 36,
                  width: `${springEntrance * 80}%`,
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
                }}
              />
            </AbsoluteFill>
          );
        })()}
      </Sequence>

      {/* ========================================================================= */}
      {/* CENA 2: A SOLUÇÃO / PRODUTO / BENEFÍCIO (3.75s a 7.5s / Frames 112 a 224) */}
      {/* ========================================================================= */}
      <Sequence from={SCENE_FRAMES} durationInFrames={SCENE_FRAMES}>
        {(() => {
          const sFrame = frame - SCENE_FRAMES;
          const cardSpring = spring({
            frame: sFrame,
            fps,
            config: { damping: 13, mass: 0.7, stiffness: 130 },
          });

          const sceneData = cardAnalysis.scenes[1] || {
            textOverlay: "CARDÁPIO E OFERTAS DO DIA ATUALIZADOS",
            subtext: "Receba pedidos direto no seu WhatsApp sem complicações",
          };

          return (
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 40px",
                zIndex: 30,
              }}
            >
              {/* Card de Apresentação da Solução / Mockup de Interface */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "rgba(20, 20, 28, 0.88)",
                  backdropFilter: "blur(24px)",
                  border: `2px solid ${primaryColor}77`,
                  borderRadius: 32,
                  padding: "40px 32px",
                  boxShadow: `0 30px 80px rgba(0,0,0,0.8), 0 0 30px ${primaryColor}22`,
                  transform: `scale(${cardSpring}) translateY(${(1 - cardSpring) * 50}px)`,
                  opacity: cardSpring,
                  textAlign: "center",
                }}
              >
                {/* Ícone de Destaque */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 72,
                    height: 72,
                    borderRadius: 24,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                    fontSize: 36,
                    marginBottom: 20,
                    boxShadow: `0 10px 30px ${primaryColor}77`,
                  }}
                >
                  ✨
                </div>

                {/* Texto Principal da Solução */}
                <KineticTypography
                  text={sceneData.textOverlay}
                  fontSize={44}
                  delayFrames={0}
                  accentColor={accentColor}
                  highlightWords={["rápido", "mesma", "cardápio", "ofertas", "atualizados", "dia"]}
                />

                {/* Subtexto descritivo */}
                {sceneData.subtext && (
                  <p
                    style={{
                      marginTop: 20,
                      color: "#D0D0D8",
                      fontSize: 22,
                      fontWeight: 600,
                      lineHeight: 1.35,
                    }}
                  >
                    {sceneData.subtext}
                  </p>
                )}
              </div>
            </AbsoluteFill>
          );
        })()}
      </Sequence>

      {/* ========================================================================= */}
      {/* CENA 3: A OFERTA / CONDIÇÃO / PREÇO (7.5s a 11.25s / Frames 224 a 336)   */}
      {/* ========================================================================= */}
      <Sequence from={SCENE_FRAMES * 2} durationInFrames={SCENE_FRAMES}>
        {(() => {
          const sFrame = frame - SCENE_FRAMES * 2;
          const popSpring = spring({
            frame: sFrame,
            fps,
            config: { damping: 11, mass: 0.5, stiffness: 160 },
          });

          const pulse = 1 + Math.sin(sFrame * 0.3) * 0.03;

          const sceneData = cardAnalysis.scenes[2] || {
            textOverlay: "PEÇA PELO WHATSAPP COM CONDIÇÕES ESPECIAIS",
            subtext: "Atendimento direto e prático para o seu pedido",
          };

          return (
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 40px",
                zIndex: 30,
              }}
            >
              {/* Badge de Oferta Especial */}
              <div
                style={{
                  transform: `scale(${popSpring * pulse}) rotate(-2deg)`,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    backgroundColor: accentColor,
                    color: "#0A0A0F",
                    fontWeight: 900,
                    fontSize: 22,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "10px 28px",
                    borderRadius: 16,
                    boxShadow: `0 10px 35px ${accentColor}88`,
                    border: "2px solid #FFFFFF",
                  }}
                >
                  🔥 CONDIÇÃO EXCLUSIVA
                </div>
              </div>

              {/* Título da Oferta */}
              <KineticTypography
                text={sceneData.textOverlay}
                fontSize={50}
                delayFrames={2}
                accentColor={accentColor}
                highlightWords={["whatsapp", "condições", "especiais", "pix", "dinheiro", "atacado"]}
              />

              {/* Selos de Benefício / Pagamento */}
              <div
                style={{
                  marginTop: 30,
                  display: "flex",
                  gap: 14,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    backgroundColor: "rgba(22, 22, 30, 0.9)",
                    border: `1.5px solid ${accentColor}`,
                    padding: "16px",
                    borderRadius: 22,
                    color: "#FFFFFF",
                    fontSize: 22,
                    fontWeight: 800,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                  }}
                >
                  <span style={{ fontSize: 26 }}>📲</span>
                  <span>WHATSAPP</span>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    backgroundColor: "rgba(22, 22, 30, 0.9)",
                    border: `1.5px solid ${primaryColor}`,
                    padding: "16px",
                    borderRadius: 22,
                    color: "#FFFFFF",
                    fontSize: 22,
                    fontWeight: 800,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                  }}
                >
                  <span style={{ fontSize: 26 }}>⚡</span>
                  <span>PEDIDO RÁPIDO</span>
                </div>
              </div>
            </AbsoluteFill>
          );
        })()}
      </Sequence>

      {/* ========================================================================= */}
      {/* CENA 4: CHAMADA PARA AÇÃO (CTA) (11.25s a 15s / Frames 336 a 450)        */}
      {/* ========================================================================= */}
      <Sequence from={SCENE_FRAMES * 3} durationInFrames={SCENE_FRAMES}>
        {(() => {
          const sFrame = frame - SCENE_FRAMES * 3;
          const ctaSpring = spring({
            frame: sFrame,
            fps,
            config: { damping: 13, mass: 0.7, stiffness: 140 },
          });

          const btnPulse = 1 + Math.sin(sFrame * 0.35) * 0.04;
          const sheenX = interpolate(sFrame, [0, 80], [-100, 200], {
            extrapolateRight: "clamp",
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
              <div
                style={{
                  textAlign: "center",
                  width: "100%",
                  transform: `scale(${ctaSpring}) translateY(${(1 - ctaSpring) * 40}px)`,
                  opacity: ctaSpring,
                }}
              >
                {/* Título de Fechamento */}
                <KineticTypography
                  text={cardAnalysis.ctaText || "GARANTA O SEU AGORA!"}
                  fontSize={52}
                  delayFrames={0}
                  accentColor={accentColor}
                  highlightWords={["agora", "garanta", "peça", "aproveite"]}
                />

                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: 24,
                    fontWeight: 600,
                    marginTop: 18,
                    marginBottom: 36,
                    lineHeight: 1.3,
                  }}
                >
                  {cardAnalysis.ctaSubtext || "Envie uma mensagem ou clique no link da bio"}
                </p>

                {/* Botão de Ação com Efeito de Luz */}
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    transform: `scale(${btnPulse})`,
                    overflow: "hidden",
                    borderRadius: 999,
                    boxShadow: `0 14px 40px ${primaryColor}AA, 0 0 30px ${accentColor}66`,
                  }}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                      color: "#FFFFFF",
                      fontSize: 30,
                      fontWeight: 900,
                      padding: "22px 52px",
                      borderRadius: 999,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      border: "2px solid rgba(255,255,255,0.45)",
                    }}
                  >
                    <span>Fale Conosco</span>
                    <span style={{ fontSize: 34 }}>👉</span>
                  </div>

                  {/* Feixe de Luz (Sheen) */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${sheenX}%`,
                      width: "45%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                      transform: "skewX(-25deg)",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {/* Indicador de Ação no Rodapé */}
                <div
                  style={{
                    marginTop: 36,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: 18,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
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
