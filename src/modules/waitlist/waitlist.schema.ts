import { z } from 'zod';

// Schema para o corpo da requisição (apenas email)
export const joinWaitlistSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please provide a valid email address' })
    .transform((email) => email.toLowerCase().trim())
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

export const waitlistResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    email: z.string().email(),
    createdAt: z.string().datetime(),
  }).optional(),
});

export type WaitlistResponse = z.infer<typeof waitlistResponseSchema>;
