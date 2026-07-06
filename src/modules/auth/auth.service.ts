import jwt from 'jsonwebtoken';
import { User, IUser } from './user.model';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import { Role } from '../../types';

const signToken = (user: IUser): string => {
  return jwt.sign({ userId: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || Role.EMPLOYEE,
  });

  const token = signToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
