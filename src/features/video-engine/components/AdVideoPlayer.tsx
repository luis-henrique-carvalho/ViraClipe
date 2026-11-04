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
import { Play, RotateCcw, Volume2, VolumeX, Smartphone, Monitor, Square } from "lucide-react";

interface AdVideoPlayerProps {
  props: Omit<AdVideoCompositionProps, "aspectRatio">;
  initialAspectRatio?: VideoAspectRatio;
}

export const AdVideoPlayer: React.FC<AdVideoPlayerProps> = ({
  props,
  initialAspectRatio = "9:16",
}) => {
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(initialAspectRatio);
  const [muted, setMuted] = useState(false);

  const config = ASPECT_RATIOS[aspectRatio];

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Seletor de Formatos (9:16, 4:5, 1:1) como no URL2Ad */}
      <div className="flex items-center gap-2 mb-4 bg-white p-1.5 rounded-2xl border border-[#E3DFD6] shadow-sm">
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
          9:16 Reels / TikTok
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

      {/* Frame do Smartphone Estilo URL2Ad */}
      <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-[36px] p-3 bg-[#111111] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] border-4 border-[#222]">
        {/* Notch / Speaker bar */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1a1a1a] rounded-full z-30" />

        <div className="w-full h-full rounded-[26px] overflow-hidden bg-black relative">
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
        </div>
      </div>

      {/* Metadados e Specs do Vídeo */}
      <div className="flex items-center justify-between w-full mt-4 text-xs text-[#55534E] px-4">
        <span>Duração: 15 segundos (450 frames)</span>
        <span>Renderizador: Remotion + Edge-TTS</span>
      </div>
    </div>
  );
};
