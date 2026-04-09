import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";

import auth from './src/routes/auth.routes';
import employees from './src/routes/employees.routes';
import schedule from './src/routes/schedule.routes';  
import availability from './src/routes/availability.routes'; 



const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 5050);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Employee Scheduling API.' });
});
app.use('/auth' , auth);
app.use('/employees', employees);
app.use('/schedule', schedule);
app.use('/availabilities', availability);


const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// server.on('error', (error) => {
//   if (error.code === 'EADDRINUSE') {
//     console.error(`Port ${PORT} is already in use. Set BACKEND_PORT to a free port and retry.`);
//   } else {
//     console.error('Backend failed to start:', error.message);
//   }

//   process.exit(1);
// });
