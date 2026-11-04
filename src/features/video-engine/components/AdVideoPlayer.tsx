import React, { useState } from "react";
import { Player } from "@remotion/player";
import {
  ASPECT_RATIOS,
  type VideoAspectRatio,
  type AdVideoCompositionProps,
  VIDEO_FPS,
  VIDEO_DURATION_IN_FRAMES,
} from "../types";
import { AdVideoComposition } from "../remotion/AdVideoComposition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Monitor,
  Square,
  Download,
  Film,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface AdVideoPlayerProps {
  props: Omit<AdVideoCompositionProps, "aspectRatio">;
  initialAspectRatio?: VideoAspectRatio;
}

export const AdVideoPlayer: React.FC<AdVideoPlayerProps> = ({
  props,
  initialAspectRatio = "9:16",
}) => {
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(initialAspectRatio);
  const [playerMode, setPlayerMode] = useState<"mp4" | "interactive">(
    props.videoUrl ? "mp4" : "interactive"
  );

  const config = ASPECT_RATIOS[aspectRatio];

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Seletor de Formatos e Modo do Player */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-4 px-2">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#E3DFD6] shadow-sm">
          <button
            type="button"
            onClick={() => setAspectRatio("9:16")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              aspectRatio === "9:16"
                ? "bg-[#111111] text-white shadow-sm"
                : "text-[#55534E] hover:text-[#111111]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            9:16 Reels
          </button>

          <button
            type="button"
            onClick={() => setAspectRatio("4:5")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              aspectRatio === "4:5"
                ? "bg-[#111111] text-white shadow-sm"
                : "text-[#55534E] hover:text-[#111111]"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            4:5 Feed
          </button>

          <button
            type="button"
            onClick={() => setAspectRatio("1:1")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              aspectRatio === "1:1"
                ? "bg-[#111111] text-white shadow-sm"
                : "text-[#55534E] hover:text-[#111111]"
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            1:1 Quadrado
          </button>
        </div>

        {/* Alternador de Modo: Vídeo Real MP4 vs Player Interativo */}
        {props.videoUrl && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E3DFD6] shadow-sm">
            <button
              type="button"
              onClick={() => setPlayerMode("mp4")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                playerMode === "mp4"
                  ? "bg-[#FF5A1F] text-white shadow-sm"
                  : "text-[#55534E] hover:text-[#111111]"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              MP4 Hypit
            </button>
            <button
              type="button"
              onClick={() => setPlayerMode("interactive")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                playerMode === "interactive"
                  ? "bg-[#111111] text-white shadow-sm"
                  : "text-[#55534E] hover:text-[#111111]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Remotion
            </button>
          </div>
        )}
      </div>

      {/* Frame do Smartphone */}
      <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-[36px] p-3 bg-[#111111] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] border-4 border-[#222]">
        {/* Notch / Speaker bar */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1a1a1a] rounded-full z-30" />

        <div className="w-full h-full rounded-[26px] overflow-hidden bg-black relative">
          {playerMode === "mp4" && props.videoUrl ? (
            <video
              src={props.videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Player
              component={AdVideoComposition}
              inputProps={{
                ...props,
                aspectRatio,
              }}
              durationInFrames={VIDEO_DURATION_IN_FRAMES}
              fps={VIDEO_FPS}
              compositionWidth={config.width}
              compositionHeight={config.height}
              style={{
                width: "100%",
                height: "100%",
              }}
              controls
              autoPlay
              loop
            />
          )}
        </div>
      </div>

      {/* Ações e Download do Arquivo MP4 */}
      <div className="flex flex-col items-center gap-3 w-full mt-5 px-4">
        {props.videoUrl ? (
          <a
            href={props.videoUrl}
            download={`anuncio-${props.cardAnalysis.brandName.toLowerCase().replace(/\s+/g, "-")}.mp4`}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#FF5A1F] hover:bg-[#E04B14] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Baixar Vídeo MP4 (1080x1920)
          </a>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#77746D]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Vídeo renderizado em tempo real no navegador
          </div>
        )}

        {/* Metadados e Specs do Vídeo */}
        <div className="flex items-center justify-between w-full text-xs text-[#77746D] pt-2 border-t border-[#E3DFD6]">
          <span>Duração: 15s (450 frames @ 30fps)</span>
          <span>Motor: {props.videoUrl ? "Hypit + Chrome Shell + FFmpeg" : "Remotion Player"}</span>
        </div>
      </div>
    </div>
  );
};
