import { z } from "zod";

export const joinWaitlistSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address" })
    .transform((email) => email.toLowerCase().trim()),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

export const waitlistResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      email: z.string().email(),
      createdAt: z.string().datetime(),
    })
    .optional(),
});

export const waitlistEmailSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  created_at: z.union([z.string().datetime(), z.date()]),
  ip_address: z.string().nullable(),
});

export const waitlistStatsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    count: z.number(),
    lastUpdated: z.string().datetime(),
    emails: z.array(waitlistEmailSchema),
  }),
});

export type WaitlistResponse = z.infer<typeof waitlistResponseSchema>;
export type WaitlistStatsResponse = z.infer<typeof waitlistStatsResponseSchema>;
