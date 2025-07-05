import bcrypt from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import { userRepository } from './user.repository.js';
import { LoginUserInput, RegisterUserInput } from './user.schema.js';

const SALT_ROUNDS = 10;

export const userService = {
  async registerUser(fastify: FastifyInstance, input: RegisterUserInput) {
    const { email, name, password } = input;

    const existingUserByEmail = await userRepository.findUserByEmail(email);
    if (existingUserByEmail) {
      throw new Error('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userRepository.createUser({
      email,
      name,
      passwordHash,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async loginUser(fastify: FastifyInstance, input: LoginUserInput) {
    const { email, password } = input;

    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async findUsersByName(name: string) {
    if (!name || name.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }
    
    const users = await userRepository.findUsersByName(name);
    
    // Remove password hashes from the response
    return users.map(({ passwordHash, ...userWithoutPassword }) => userWithoutPassword);
  },

  async updateUser(userId: string, updateData: { email?: string; name?: string }) {
    // Verificar se o email já existe (se estiver sendo atualizado)
    if (updateData.email) {
      const existingUser = await userRepository.findUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  async updateUserAvatar(userId: string, profileImage: string) {
    const updatedUser = await userRepository.updateUserAvatar(userId, profileImage);
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  async updateUserTheme(userId: string, theme: string) {
    const updatedUser = await userRepository.updateUserTheme(userId, theme);
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  async findUserById(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return null;
    }
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
