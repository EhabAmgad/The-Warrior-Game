import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

import router from './routes/router';
import errorHandler from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const DATABASEURL = process.env.DB_URL as string;

// 1. View Engine Setup (يجب أن يكون في البداية)
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// 3. Logger مؤقت للتحقق من وصول الطلبات
app.use((req, res, next) => {
  console.log(`📩 Request: ${req.method} ${req.url}`);
  next();
});

// 4. Routes
app.use(router);

// 5. Error Handler (يجب أن يكون دائماً آخر middleware)
app.use(errorHandler);

// Connect to Database & Start Server
mongoose
  .connect(DATABASEURL)
  .then(() => {
    console.log('Connected successfully to DataBase ..!!');
    app.listen(PORT, () => {
      console.log(`The Server port is ==> http://localhost:${PORT}`);
    });
  })
  .catch((err: any) => {
    console.log('Failed to connect to DataBase ..!!');
    console.log('The error is :', err);
  });

  // في نهاية src/app.ts
export default app;