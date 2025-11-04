const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Configuración de logging
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFile = path.join(LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);

// Guardar referencias originales ANTES de cualquier override
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

function writeLog(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = data 
    ? `[${timestamp}] [${level}] ${message} ${JSON.stringify(data)}\n`
    : `[${timestamp}] [${level}] ${message}\n`;
  
  // Escribir al archivo solo si no es un mensaje de log interno
  if (!message.includes('writeLog') && !message.includes('appendFileSync')) {
    try {
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      // Si falla escribir al archivo, usar console original directamente
      originalConsoleError('Error writing to log file:', error.message);
    }
  }
  
  // Escribir a console original para que aparezca en los logs de IIS
  if (level === 'ERROR') {
    originalConsoleError(`[${timestamp}] ${message}`, data || '');
  } else if (level === 'WARN') {
    originalConsoleWarn(`[${timestamp}] ${message}`, data || '');
  } else {
    originalConsoleLog(`[${timestamp}] ${message}`, data || '');
  }
}

// Override console methods para capturar todos los logs
console.log = (...args) => {
  const message = args.join(' ');
  writeLog('INFO', message);
};

console.error = (...args) => {
  const message = args.join(' ');
  writeLog('ERROR', message);
};

console.warn = (...args) => {
  const message = args.join(' ');
  writeLog('WARN', message);
};

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Usar NEXTAUTH_URL para determinar la URL base
const baseUrl = process.env.NEXTAUTH_URL || `http://${hostname}:${port}`;

writeLog('INFO', '🚀 Iniciando servidor Next.js', { 
  dev, 
  hostname, 
  port,
  baseUrl,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/',
  nodeEnv: process.env.NODE_ENV,
  processId: process.pid
});

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  writeLog('INFO', '✅ Next.js preparado correctamente');
  
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Log de requests importantes (filtrar assets estáticos)
      if (!req.url.includes('/_next/') && !req.url.includes('/favicon.ico')) {
        writeLog('INFO', `📡 Request: ${req.method} ${req.url}`, {
          userAgent: req.headers['user-agent']?.substring(0, 50),
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
      }
      
      await handle(req, res, parsedUrl);
      
    } catch (err) {
      writeLog('ERROR', '❌ Error handling request', {
        url: req.url,
        method: req.method,
        error: err.message,
        stack: err.stack
      });
      
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
  .once('error', (err) => {
    writeLog('ERROR', '❌ Error fatal del servidor', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  })
  .listen(port, () => {
    writeLog('INFO', `🌟 Servidor corriendo en ${baseUrl}`);
    writeLog('INFO', `Environment: ${dev ? 'development' : 'production'}`);
    writeLog('INFO', `Base Path: ${process.env.NEXT_PUBLIC_BASE_PATH || '/'}`);
  });
}).catch((err) => {
  writeLog('ERROR', '❌ Error preparando Next.js', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
  writeLog('ERROR', '💥 Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  writeLog('ERROR', '💥 Unhandled Rejection', {
    reason: reason,
    promise: promise
  });
});

// Log al cerrar el proceso
process.on('SIGINT', () => {
  writeLog('INFO', '🛑 Servidor cerrándose por SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  writeLog('INFO', '🛑 Servidor cerrándose por SIGTERM');
  process.exit(0);
});
