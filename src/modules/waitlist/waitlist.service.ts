import { FastifyRequest } from 'fastify';
import { sendWaitlistConfirmationEmail } from '../../utils/email.js';
import { JoinWaitlistInput } from './waitlist.schema.js';
import { WaitlistRepository } from './waitlist.repository.js';

export class WaitlistService {
  /**
   * Join the waitlist with email
   */
  static async joinWaitlist(
    data: JoinWaitlistInput,
    ipAddress?: string
  ) {
    try {
      // Add to waitlist - apenas o email é necessário
      const waitlistEntry = await WaitlistRepository.addToWaitlist({
        email: data.email,
        ipAddress,
      });

      // Send confirmation email (não usar await para não bloquear a resposta)
      this.sendConfirmationEmail(data.email).catch((error) => {
        console.error('Falha ao enviar e-mail de confirmação:', error);
      });

      return {
        success: true,
        message: 'Successfully joined the waitlist!',
        data: {
          email: waitlistEntry.email,
          createdAt: waitlistEntry.created_at.toISOString(),
        },
      };
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return {
          success: false,
          error: {
            message: 'This email is already on the waitlist',
            code: 'EMAIL_ALREADY_EXISTS',
          },
        };
      }

      console.error('Error joining waitlist:', error);
      throw new Error('Failed to join waitlist');
    }
  }

  /**
   * Send confirmation email to the subscriber
   */
  private static async sendConfirmationEmail(email: string) {
    try {
      await sendWaitlistConfirmationEmail(email);
      console.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send confirmation email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Get waitlist stats
   */
  static async getWaitlistStats() {
    try {
      const count = await WaitlistRepository.getWaitlistCount();
      return {
        success: true,
        data: {
          count,
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error getting waitlist stats:', error);
      throw new Error('Failed to get waitlist stats');
    }
  }

  /**
   * Get client IP address from request
   */
  static getClientIp(request: FastifyRequest): string | undefined {
    // Try to get the IP from the X-Forwarded-For header (common with proxies)
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded && typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    
    // Fall back to the connection remote address
    return request.ip;
  }
}
