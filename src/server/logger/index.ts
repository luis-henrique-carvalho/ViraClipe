export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export function createServerLogger(namespace: string): Logger {
  const format = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    const ctxString = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] [${namespace}] ${message}${ctxString}`;
  };

  return {
    debug: (msg, ctx) => {
      if (process.env.NODE_ENV !== "production") {
        console.debug(format("debug", msg, ctx));
      }
    },
    info: (msg, ctx) => console.log(format("info", msg, ctx)),
    warn: (msg, ctx) => console.warn(format("warn", msg, ctx)),
    error: (msg, ctx) => console.error(format("error", msg, ctx)),
  };
}
