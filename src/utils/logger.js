import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initializing the logger format
const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format to extract filename and line number from stack trace
const appendFileAndLine = winston.format((info) => {
    const stackInfo = getStackInfo(10); // Capture stack trace to find caller
    if (stackInfo) {
        info.filename = stackInfo.relativePath;
        info.line = stackInfo.line;
    }
    return info;
});

// Helper function to parse stack trace
const getStackInfo = (stackIndex) => {
    const stacklist = (new Error()).stack.split('\n').slice(3);
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
    const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

    const s = stacklist[stackIndex] || stacklist[0];
    const sp = stackReg.exec(s) || stackReg2.exec(s);

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(path.resolve(__dirname, '../../'), sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join('\n')
        };
    }

    // Try to find the first call from our project files (excluding node_modules and logger.js)
    for (let i = 0; i < stacklist.length; i++) {
        const line = stacklist[i];
        if (line.includes(process.cwd()) && !line.includes('node_modules') && !line.includes('logger.js')) {
            const match = line.match(/\((.*):(\d+):(\d+)\)/) || line.match(/at\s+(.*):(\d+):(\d+)/);
            if (match) {
                let filePath = match[1] || match[0]; // fallback
                if (match[1]) filePath = match[1];

                return {
                    relativePath: path.relative(process.cwd(), filePath),
                    line: match[2]
                }
            }
        }
    }

    return null;
};

const customFormat = printf(({ level, message, timestamp, filename, line, stack }) => {
    const location = filename ? `[${filename}:${line}]` : '';
    return `${timestamp} ${level}: ${location} ${stack || message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        appendFileAndLine(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // handle exceptions
        customFormat
    ),
    transports: [
        // Write all logs to `logs/app.log`
        new winston.transports.File({ filename: 'logs/app.log' }),

        // Write all logs to console as well
        new winston.transports.Console({
            format: combine(
                colorize(), // Colorize the output
                customFormat
            )
        })
    ],
});

export default logger;
