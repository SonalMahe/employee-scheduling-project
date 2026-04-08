import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { requireAdmin } from "../src/middleware/requireAdmin";
import { createEmployeeSchema, updateEmployeeSchema } from "../src/types";

const prisma = new PrismaClient();
export const employeeRouter = Router();

employeeRouter.use(requireAdmin); // protects all routes below

// GET /api/employees
employeeRouter.get("/", async (_req: Request, res: Response) => {
  const employees = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      loginCode: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(employees);
});

// POST /api/employees
employeeRouter.post("/", async (req: Request, res: Response) => {
  const result = createEmployeeSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }
  const { firstName, lastName, email, code, role, photoBase64 } = result.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    res.status(409).json({ error: "An employee with this email already exists." });
    return;
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      code,
      role,
      photo: photoBase64 ?? null,
    },
  });

  res.status(201).json({ success: true, id: user.id });
});

// PUT /api/employees/:id
employeeRouter.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid employee ID." });
    return;
  }

  const result = updateEmployeeSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }
  const { firstName, lastName, email, code, role, photoBase64 } = result.data;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: "Employee not found." });
    return;
  }

  if (email && email.toLowerCase() !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: "An employee with this email already exists." });
      return;
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email: email.toLowerCase() }),
      ...(code && { code }),
      ...(role && { role }),
      ...(photoBase64 !== undefined && { photo: photoBase64 ?? null }),
    },
  });

  res.json({ success: true, id: updated.id });
});

// DELETE /api/employees/:id
employeeRouter.delete(
  "/:id",
  requireAdmin,
  async (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid employee ID." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: "Employee not found." });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  },
);