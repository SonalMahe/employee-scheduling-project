import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 5050);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Employee Scheduling API...." });
});

// Get all employees
app.get("/employees", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      email: emp.user.email,
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Set BACKEND_PORT to a free port and retry.`,
    );
  } else {
    console.error("Backend failed to start:", error.message);
  }

  process.exit(1);
});
