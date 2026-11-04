import { z } from "zod";

export const instagramPostSchema = z.object({
  id: z.string(),
  mediaUrl: z.string().url(),
  caption: z.string().optional(),
  timestamp: z.string().optional(),
  isCarousel: z.boolean().default(false),
  carouselImages: z.array(z.string().url()).optional(),
  likeCount: z.number().optional(),
});

export type InstagramPost = z.infer<typeof instagramPostSchema>;

export const instagramProfileResultSchema = z.object({
  username: z.string(),
  fullName: z.string().optional(),
  biography: z.string().optional(),
  avatarUrl: z.string().optional(),
  posts: z.array(instagramPostSchema),
});

export type InstagramProfileResult = z.infer<typeof instagramProfileResultSchema>;

export const uploadCardInputSchema = z.object({
  dataUrl: z.string().min(1, "A imagem do card é obrigatória"),
  caption: z.string().optional(),
  aspectRatio: z.enum(["9:16", "4:5", "1:1"]).default("9:16"),
});

export type UploadCardInput = z.infer<typeof uploadCardInputSchema>;
