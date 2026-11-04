import { z } from "zod";

export const clientEnvSchema = z.object({
  VITE_PUBLIC_APP_NAME: z.string().min(1).default("Card2Ad • Do Card ao Vídeo em 15s"),
  VITE_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function validateClientEnv(envSource?: Record<string, unknown>): ClientEnv {
  const source =
    envSource ??
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env
      : {});

  const normalize = (val: unknown) =>
    typeof val === "string" && val.trim() === "" ? undefined : val;

  return clientEnvSchema.parse({
    VITE_PUBLIC_APP_NAME: normalize(source.VITE_PUBLIC_APP_NAME),
    VITE_PUBLIC_APP_URL: normalize(source.VITE_PUBLIC_APP_URL),
  });
}

export const clientEnv = validateClientEnv();
