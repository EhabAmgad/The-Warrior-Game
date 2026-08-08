import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

import router from './routes/router';
import errorHandler from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;
const DATABASEURL = process.env.DB_URL as string;

// 1. View Engine Setup (مسار دقيق يعمل محلياً وعلى Vercel)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

// 3. Connection to MongoDB (Cached Connection)
if (DATABASEURL) {
  mongoose
    .connect(DATABASEURL)
    .then(() => console.log('Connected successfully to DataBase ..!!'))
    .catch((err) => console.error('Failed to connect to DataBase:', err));
}

// 4. Routes
app.use(router);

// 5. Error Handler
app.use(errorHandler);

// شغّل الـ listen محلياً فقط
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`The Server port is ==> http://localhost:${PORT}`);
  });
}

export default app;