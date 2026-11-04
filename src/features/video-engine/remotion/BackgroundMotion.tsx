import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";
import { VIDEO_DURATION_IN_FRAMES } from "../types";

interface BackgroundMotionProps {
  imageUrl: string;
}

export const BackgroundMotion: React.FC<BackgroundMotionProps> = ({ imageUrl }) => {
  const frame = useCurrentFrame();

  // Zoom lento suave (Ken Burns) de 1.0 para 1.12 ao longo dos 15 segundos
  const scale = interpolate(frame, [0, VIDEO_DURATION_IN_FRAMES], [1.0, 1.12], {
    extrapolateRight: "clamp",
  });

  // Movimento sutil vertical
  const translateY = interpolate(frame, [0, VIDEO_DURATION_IN_FRAMES], [0, -25], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <Img
        src={imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateY(${translateY}px)`,
          filter: "brightness(0.92) contrast(1.05)",
        }}
      />
      {/* Vinheta suave de gradiente para garantir legibilidade dos textos */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
};
