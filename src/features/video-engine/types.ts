import type { CardAnalysisResult } from "@/features/vision-engine/data/vision.schema";

export type VideoAspectRatio = "9:16" | "4:5" | "1:1";

export interface AspectRatioConfig {
  width: number;
  height: number;
  label: string;
  badge: string;
}

export const ASPECT_RATIOS: Record<VideoAspectRatio, AspectRatioConfig> = {
  "9:16": {
    width: 1080,
    height: 1920,
    label: "Reels / TikTok / Shorts (9:16)",
    badge: "9:16 Vertical",
  },
  "4:5": {
    width: 1080,
    height: 1350,
    label: "Feed do Instagram (4:5)",
    badge: "4:5 Feed",
  },
  "1:1": {
    width: 1080,
    height: 1080,
    label: "Quadrado / Feed (1:1)",
    badge: "1:1 Quadrado",
  },
};

export interface AdVideoCompositionProps {
  cardAnalysis: CardAnalysisResult;
  backgroundImageUrl: string;
  audioUrl?: string;
  videoUrl?: string;
  aspectRatio: VideoAspectRatio;
}

export const VIDEO_FPS = 30;
export const VIDEO_DURATION_IN_SECONDS = 15;
export const VIDEO_DURATION_IN_FRAMES = VIDEO_FPS * VIDEO_DURATION_IN_SECONDS; // 450 frames
