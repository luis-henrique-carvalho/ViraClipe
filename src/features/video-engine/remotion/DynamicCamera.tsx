import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";

interface DynamicCameraProps {
  imageUrl: string;
}

export const DynamicCamera: React.FC<DynamicCameraProps> = ({ imageUrl }) => {
  const frame = useCurrentFrame();

  // Duração de cada cena: 112 frames (~3.75s)
  const SCENE_FRAMES = 112;

  // Determina a cena atual (0 a 3)
  const currentScene = Math.min(3, Math.floor(frame / SCENE_FRAMES));
  const sceneFrame = frame % SCENE_FRAMES;

  // =========================================================================
  // ENQUADRAMENTO E CÂMERA DINÂMICA POR CENA (Motion Graphics real, não estático)
  // =========================================================================
  let scale = 1.1;
  let translateX = 0;
  let translateY = 0;
  let overlayDarkness = 0.45;

  if (currentScene === 0) {
    // CENA 1 (O Gancho): Push-in rápido e dramático em direção ao topo/centro
    scale = interpolate(sceneFrame, [0, SCENE_FRAMES], [1.05, 1.28], {
      extrapolateRight: "clamp",
    });
    translateY = interpolate(sceneFrame, [0, SCENE_FRAMES], [0, -30], {
      extrapolateRight: "clamp",
    });
    overlayDarkness = 0.55;
  } else if (currentScene === 1) {
    // CENA 2 (Destaque do Produto/Looks): Corte para a metade inferior (arara de roupas/produtos)
    scale = interpolate(sceneFrame, [0, SCENE_FRAMES], [1.38, 1.55], {
      extrapolateRight: "clamp",
    });
    translateY = interpolate(sceneFrame, [0, SCENE_FRAMES], [-160, -195], {
      extrapolateRight: "clamp",
    });
    translateX = interpolate(sceneFrame, [0, SCENE_FRAMES], [-15, 20], {
      extrapolateRight: "clamp",
    });
    overlayDarkness = 0.40;
  } else if (currentScene === 2) {
    // CENA 3 (A Oferta / Atacado / Preço): Pull-back dinâmico com iluminação dramática
    scale = interpolate(sceneFrame, [0, SCENE_FRAMES], [1.45, 1.22], {
      extrapolateRight: "clamp",
    });
    translateY = interpolate(sceneFrame, [0, SCENE_FRAMES], [-60, -20], {
      extrapolateRight: "clamp",
    });
    overlayDarkness = 0.65; // Mais escuro para destacar o valor promocional e selos
  } else {
    // CENA 4 (Chamada para Ação): Visão geral estabilizada com respiração sutil
    scale = interpolate(sceneFrame, [0, SCENE_FRAMES], [1.18, 1.12], {
      extrapolateRight: "clamp",
    });
    translateY = interpolate(sceneFrame, [0, SCENE_FRAMES], [-20, 0], {
      extrapolateRight: "clamp",
    });
    overlayDarkness = 0.60;
  }

  // Transição de Corte (Flash branco sutil de 3 frames nos cortes entre cenas)
  const isTransition = sceneFrame < 4 && frame > 4;
  const flashOpacity = isTransition ? interpolate(sceneFrame, [0, 3], [0.35, 0]) : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#0A0A0A",
      }}
    >
      {/* Imagem com transformações dinâmicas de câmera */}
      <Img
        src={imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          filter: "brightness(0.92) contrast(1.10)",
          willChange: "transform",
        }}
      />

      {/* Camada de Gradiente / Vinheta Cinematográfica para legibilidade de estúdio */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at center, rgba(0,0,0,${overlayDarkness * 0.4}) 0%, rgba(0,0,0,${overlayDarkness}) 100%)`,
        }}
      />

      {/* Gradientes Superior e Inferior para Header e Footer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "25%",
          background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "35%",
          background: "linear-gradient(0deg, rgba(0,0,0,0.88) 0%, transparent 100%)",
        }}
      />

      {/* Flash de corte de cena */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
            opacity: flashOpacity,
            zIndex: 15,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
