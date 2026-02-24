type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function write(level: LogLevel, message: string, data?: unknown) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...(data !== undefined ? { data } : {}),
  };
  if (level === 'error' || level === 'warn') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info:  (msg: string, data?: unknown) => write('info',  msg, data),
  warn:  (msg: string, data?: unknown) => write('warn',  msg, data),
  error: (msg: string, data?: unknown) => write('error', msg, data),
  debug: (msg: string, data?: unknown) => write('debug', msg, data),
};
