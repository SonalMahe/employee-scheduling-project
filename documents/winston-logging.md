# Logging with Winston in Node.js

## 1. What Is Logging?

Logging means recording what happens inside your application while it runs.

Basic logging uses `console.log`, but Winston provides:

* File-based logging
* Log levels (info, warn, error)
* Structured and formatted logs

 Logs help debug issues even after the server stops.

---

## 2. Installing Winston

```bash
npm install winston
```

---

## 3. Creating Logger File

Create a file:

```bash
touch logger.js
```

---

## 4. Setting Up Logger

```js
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",

  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),

  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
    new transports.Console(),
  ],
});

export default logger;
```

---

## 5. Log Levels

| Level | Use               |
| ----- | ----------------- |
| info  | Normal events     |
| warn  | Unexpected issues |
| error | Serious problems  |

---

## 6. Using Logger

```js
import logger from "./logger.js";

logger.info("Server started");
logger.warn("Something unexpected");
logger.error("Something failed");
```

---

## 7. Using Logger in Routes

```js
router.get("/items", async (req, res) => {
  try {
    logger.info("Fetching items");
    res.json([]);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});
```

---

## 8. Log Files

Winston creates:

* `logs/combined.log` → all logs
* `logs/error.log` → only errors

---

## 9. Summary

| Concept      | Purpose        |
| ------------ | -------------- |
| createLogger | Creates logger |
| format       | Formats logs   |
| transports   | Where logs go  |
| logger.info  | Success logs   |
| logger.warn  | Warnings       |
| logger.error | Errors         |

---

##  Important Notes

* Replace console.log with logger
* Use correct log levels
* Store logs for debugging

---
