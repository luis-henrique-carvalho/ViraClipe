import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

interface KineticTypographyProps {
  text: string;
  delayFrames?: number;
  highlightWords?: string[];
  primaryColor?: string;
  accentColor?: string;
  fontSize?: number;
  align?: "center" | "left" | "right";
  lineHeight?: number;
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  text,
  delayFrames = 0,
  highlightWords = [],
  primaryColor = "#FFFFFF",
  accentColor = "#FF5A1F",
  fontSize = 54,
  align = "center",
  lineHeight = 1.15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(/\s+/).filter(Boolean);

  // Normaliza lista de palavras destacadas
  const cleanHighlights = highlightWords.map((w) =>
    w.toLowerCase().replace(/[^a-z0-9áéíóúãõâêîôûàèìòù]/gi, "")
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
        alignItems: "center",
        width: "100%",
        lineHeight,
      }}
    >
      {words.map((word, index) => {
        const wordStart = delayFrames + index * 3;
        const progress = spring({
          frame: frame - wordStart,
          fps,
          config: {
            damping: 12,
            mass: 0.65,
            stiffness: 140,
          },
        });

        const cleanWord = word.toLowerCase().replace(/[^a-z0-9áéíóúãõâêîôûàèìòù]/gi, "");
        const isHighlighted = cleanHighlights.some(
          (h) => h.length > 2 && (cleanWord.includes(h) || h.includes(cleanWord))
        );

        const translateY = (1 - progress) * 35;
        const scale = 0.8 + progress * 0.2;
        const opacity = Math.min(1, Math.max(0, (frame - wordStart) / 4));

        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              marginRight: "0.26em",
              marginBottom: "0.15em",
              fontSize,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              color: isHighlighted ? accentColor : "#FFFFFF",
              textShadow: isHighlighted
                ? `0 0 25px ${accentColor}AA, 0 4px 18px rgba(0,0,0,0.9)`
                : "0 6px 20px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.8)",
              filter: isHighlighted ? "drop-shadow(0 2px 10px rgba(0,0,0,0.5))" : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
