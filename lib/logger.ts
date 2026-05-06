/**
 * Logger estructurado para Suelo.
 *
 * - Formato JSON en producción, legible en dev.
 * - Preparado para conectar Sentry cuando esté configurado (SENTRY_DSN env).
 * - Redacta secretos comunes (api keys, tokens) automáticamente.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const SECRET_PATTERNS = [
  /sk-ant-[a-zA-Z0-9-]+/g,
  /sk-[a-zA-Z0-9]{20,}/g,
  /eyJ[a-zA-Z0-9_.-]+/g, // JWT
  /AC[a-f0-9]{32}/g, // Twilio SID
  /ghp_[a-zA-Z0-9]+/g, // GitHub PAT
  /re_[a-zA-Z0-9]+/g, // Resend
];

function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    return SECRET_PATTERNS.reduce(
      (s, pattern) => s.replace(pattern, '[REDACTED]'),
      value
    );
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      // Redactar campos que tengan nombres sospechosos
      if (/secret|token|key|password|authorization/i.test(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return value;
}

function write(level: Level, event: string, context?: Record<string, unknown>) {
  const isProd = process.env.NODE_ENV === 'production';
  const record = {
    level,
    event,
    time: new Date().toISOString(),
    ...(context ? { ctx: redact(context) } : {}),
  };

  if (isProd) {
    // stdout JSON, Vercel lo captura y envía a Log Drains si hay uno configurado
    console.log(JSON.stringify(record));
  } else {
    const color =
      level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
    console.log(
      `${color}[${level}]\x1b[0m ${event}`,
      context ? redact(context) : ''
    );
  }
}

export const logger = {
  debug: (event: string, context?: Record<string, unknown>) =>
    process.env.NODE_ENV !== 'production' && write('debug', event, context),
  info: (event: string, context?: Record<string, unknown>) =>
    write('info', event, context),
  warn: (event: string, context?: Record<string, unknown>) =>
    write('warn', event, context),
  error: (event: string, context?: Record<string, unknown>) => {
    write('error', event, context);
    // Hook para Sentry cuando esté conectado (no lo inicializamos acá para evitar require dinámico pesado en cold start).
    // En sentry.client.config.ts / sentry.server.config.ts se puede capturar via captureException.
  },
};
