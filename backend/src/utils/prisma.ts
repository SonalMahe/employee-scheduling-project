import { PrismaClient } from "@prisma/client"

// Create a single shared instance of PrismaClient
// This prevents creating multiple database connections
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"]  // show queries in development
    : ["error"]                    // only errors in production
})

export default prisma;