import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'; // أو الميدل وير الخاص بك
import userServices from '../services/userServices.js';

const game_home_get = (req: Request, res: Response) => {
  res.status(200).render('index');
};

const game_login_post = asyncHandler(async (req: Request, res: Response) => {
  console.log("1. Request Body received:", req.body);
  
  const userData = req.body;
  const result = await userServices.login(userData);

  console.log("2. Login result:", result);

  res.cookie('jwt', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 'success',
    message: 'User logged in successfully ..!!',
    user: result.user,
    token: result.token
  });
});

const mainController = {
  game_home_get,
  game_login_post
};

export default mainController;