import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

interface KineticTextProps {
  text: string;
  delayFrames?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  textTransform?: "uppercase" | "none";
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delayFrames = 0,
  color = "#FFFFFF",
  fontSize = 64,
  fontWeight = 800,
  fontFamily = "system-ui, -apple-system, sans-serif",
  textTransform = "uppercase",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delayFrames,
    fps,
    config: {
      damping: 14,
      mass: 0.8,
      stiffness: 120,
    },
  });

  const opacity = Math.min(1, Math.max(0, (frame - delayFrames) / 6));
  const translateY = (1 - progress) * 40;
  const scale = 0.9 + progress * 0.1;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        color,
        fontSize,
        fontWeight,
        fontFamily,
        textTransform,
        textAlign: "center",
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        textShadow: "0 4px 16px rgba(0,0,0,0.4)",
        maxWidth: "90%",
        margin: "0 auto",
      }}
    >
      {text}
    </div>
  );
};
