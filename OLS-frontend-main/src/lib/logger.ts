// ═══════════════════════════════════════════════════════════════════════════
// LOGGER - Centralized logging utility
//
// Replaces all direct console.* usage. In dev, logs to console.
// In prod, silenced (or could be wired to an external service).
// ═══════════════════════════════════════════════════════════════════════════

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDev = import.meta.env.DEV;
const minLevel: LogLevel = isDev ? 'debug' : 'warn';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function formatPrefix(level: LogLevel, tag?: string): string {
  const label = level.toUpperCase().padEnd(5);
  return tag ? `[${label}] [${tag}]` : `[${label}]`;
}

export const logger = {
  debug(message: string, ...args: unknown[]) {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(formatPrefix('debug'), message, ...args);
    }
  },

  info(message: string, ...args: unknown[]) {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(formatPrefix('info'), message, ...args);
    }
  },

  warn(message: string, ...args: unknown[]) {
    if (shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(formatPrefix('warn'), message, ...args);
    }
  },

  error(message: string, ...args: unknown[]) {
    if (shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(formatPrefix('error'), message, ...args);
    }
  },

  /** Scoped logger — all messages prefixed with [TAG] */
  tagged(tag: string) {
    return {
      debug: (message: string, ...args: unknown[]) => {
        if (shouldLog('debug')) {
          // eslint-disable-next-line no-console
          console.debug(formatPrefix('debug', tag), message, ...args);
        }
      },
      info: (message: string, ...args: unknown[]) => {
        if (shouldLog('info')) {
          // eslint-disable-next-line no-console
          console.info(formatPrefix('info', tag), message, ...args);
        }
      },
      warn: (message: string, ...args: unknown[]) => {
        if (shouldLog('warn')) {
          // eslint-disable-next-line no-console
          console.warn(formatPrefix('warn', tag), message, ...args);
        }
      },
      error: (message: string, ...args: unknown[]) => {
        if (shouldLog('error')) {
          // eslint-disable-next-line no-console
          console.error(formatPrefix('error', tag), message, ...args);
        }
      },
    };
  },
};
