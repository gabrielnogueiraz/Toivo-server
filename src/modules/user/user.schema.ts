import { z } from 'zod';

const themes = ['default', 'dark', 'zen'] as const;

export const registerUserSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(3, 'Name must be at least 3 characters long'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
});

export const loginUserSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'Password is required' }),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field to update must be provided',
});

export const updateUserThemeSchema = z.object({
  theme: z.enum(themes, {
    errorMap: () => ({ message: `Theme must be one of: ${themes.join(', ')}` }),
  }),
});

export const updateUserAvatarSchema = z.object({
  profileImage: z.string().url('Invalid URL format for profile image'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserThemeInput = z.infer<typeof updateUserThemeSchema>;
export type UpdateUserAvatarInput = z.infer<typeof updateUserAvatarSchema>;
