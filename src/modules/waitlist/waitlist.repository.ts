import { prisma } from '../../config/db.config.js';
import { JoinWaitlistInput } from './waitlist.schema.js';

export class WaitlistRepository {
  /**
   * Add email to waitlist if it doesn't already exist
   */
  static async addToWaitlist(
    data: JoinWaitlistInput & { ipAddress?: string }
  ) {
    return prisma.$transaction(async (tx) => {
      // Check if email already exists
      const existing = await tx.waitlistEmail.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      // Create new waitlist entry
      return tx.waitlistEmail.create({
        data: {
          email: data.email,
          ip_address: data.ipAddress,
        },
      });
    });
  }

  /**
   * Get all waitlist emails (paginated)
   */
  static async getWaitlistEmails({
    page = 1,
    limit = 100,
  }: {
    page?: number;
    limit?: number;
  } = {}) {
    const skip = (page - 1) * limit;
    
    const [total, emails] = await Promise.all([
      prisma.waitlistEmail.count(),
      prisma.waitlistEmail.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      data: emails,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get waitlist email by ID
   */
  static async getWaitlistEmailById(id: number) {
    return prisma.waitlistEmail.findUnique({
      where: { id },
    });
  }

  /**
   * Delete email from waitlist
   */
  static async removeFromWaitlist(email: string) {
    return prisma.waitlistEmail.delete({
      where: { email },
    });
  }

  /**
   * Get total number of waitlist subscribers
   */
  static async getWaitlistCount() {
    return prisma.waitlistEmail.count();
  }

  /**
   * Get all emails in the waitlist
   * Used for sending launch emails
   */
  static async getAllEmails() {
    return prisma.waitlistEmail.findMany({
      select: { email: true },
      orderBy: { created_at: 'asc' },
    });
  }
}
