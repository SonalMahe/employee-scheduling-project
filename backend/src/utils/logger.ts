import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const logsDir = path.join(process.cwd(), "logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),

  defaultMeta: { service: "employee-scheduling-api" },

  transports: [
    // Error logs
    new transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf((info: any) => {
          const { timestamp, level, message, ...meta } = info;
          return `${timestamp} [${level.toUpperCase()}] ${message} ${
            Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      ),
    }),

    // Combined logs (all levels)
    new transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf((info: any) => {
          const { timestamp, level, message, ...meta } = info;
          return `${timestamp} [${level.toUpperCase()}] ${message} ${
            Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      ),
    }),

    // Console output (only in development)
    ...(process.env.NODE_ENV !== "production"
      ? [
          new transports.Console({
            format: format.combine(
              format.colorize(),
              format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              format.printf((info: any) => {
                const { timestamp, level, message, ...meta } = info;
                let metaStr = "";
                if (Object.keys(meta).length > 0) {
                  metaStr = JSON.stringify(meta, null, 2);
                }
                return `${timestamp} [${level}] ${message} ${metaStr}`;
              })
            ),
          }),
        ]
      : []),
  ],
});

export default logger;
