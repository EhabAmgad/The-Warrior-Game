import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../models/usersModel.js";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
}

const register = async (userData: UserData) => {
  const secret = process.env.JWT_SECRET as string;
  const { email, password } = userData;

  // تشفير كلمة المرور قبل الحفظ
  const hashedPassword = await bcrypt.hash(password!, 10);
  const user = await userModel.create({ ...userData, password: hashedPassword });

  const token = jwt.sign({ email: user.email, id: user._id }, secret, {
    expiresIn: "1d",
  });

  return { user, token };
};

const login = async (userData: UserData) => {
  const secret = process.env.JWT_SECRET as string;
  const { email, password } = userData;

  let user = await userModel.findOne({ email });

  // 1. إذا لم يكن البريد موجوداً -> قم بإنشاء حساب جديد تلقائياً (Auto Register)
  if (!user) {
    return await register(userData);
  }

  // 2. إذا كان المستخدم موجوداً -> قارن كلمة المرور
  const match = await bcrypt.compare(password!, user.password);
  if (!match) {
    const error = new Error("البريد الالكتروني او كلمة المرور غير صحيحة") as any;
    error.statusCode = 400;
    throw error;
  }

  // 3. إنشاء التوكن وإرجاع البيانات عند صحة كلمة المرور
  const token = jwt.sign({ email: user.email, id: user._id }, secret, {
    expiresIn: "1d",
  });

  return { user, token };
};

export default {
  register,
  login,
};