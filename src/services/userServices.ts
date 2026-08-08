import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../models/usersModel";

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

  const user = await userModel.findOne({ email });

  if (!user) {
    const error = new Error("البريد الالكتروني او كلمة المرور غير صحيحة .. حاول مرة أخري") as any;
    error.statusCode = 400;
    throw error;
  }

  const match = await bcrypt.compare(password!, user.password);
  if (!match) {
    const error = new Error("البريد الالكتروني او كلمة المرور غير صحيحة .. حاول مرة أخري") as any;
    error.statusCode = 400;
    throw error;
  }

  const token = jwt.sign({ email: user.email, id: user._id }, secret, {
    expiresIn: "1d",
  });

  return { user, token };
};

export default {
  register,
  login,
};