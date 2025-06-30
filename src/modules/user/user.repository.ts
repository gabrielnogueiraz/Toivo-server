import { User } from '@prisma/client';
import { prisma } from '../../config/db.config.js';
import { RegisterUserInput, UpdateUserInput } from './user.schema.js';

export const userRepository = {
  async createUser(data: Omit<RegisterUserInput, 'password'> & { passwordHash: string }): Promise<User> {
    return prisma.user.create({
      data,
    });
  },

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findUsersByName(name: string): Promise<User[]> {
    return prisma.user.findMany({
      where: { 
        name: { 
          contains: name,
          mode: 'insensitive' 
        } 
      },
    });
  },

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async updateUserTheme(id: string, theme: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { theme },
    });
  },

  async updateUserAvatar(id: string, profileImage: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { profileImage },
    });
  },
};

