import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

import { connectDB } from './db.js';
import router from './routes/router.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;

const rootDir = process.cwd();

// 1. View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'src', 'views'));

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')));
app.use(cookieParser());

// 3. Connect DB Middleware (يضمن نجاح الاتصال قبل تنفيذ أي طلب)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'Internal Server Error: Database Connection Failed' });
  }
});

// 4. Routes
app.use(router);

// 5. Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;