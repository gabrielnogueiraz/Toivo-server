import { FastifyRequest, FastifyReply } from 'fastify';
import { joinWaitlistSchema, WaitlistResponse } from './waitlist.schema.js';
import { WaitlistService } from './waitlist.service.js';

export class WaitlistController {
  /**
   * Join the waitlist
   */
  static async joinWaitlist(
    request: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply
  ): Promise<WaitlistResponse> {
    try {
      // Validate request body
      const data = joinWaitlistSchema.parse(request.body);
      
      // Get client IP for rate limiting/analytics
      const ipAddress = WaitlistService.getClientIp(request);
      
      // Process the waitlist signup
      const result = await WaitlistService.joinWaitlist(data, ipAddress);
      
      // Return success response
      return reply.status(201).send(result);
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
      }
      
      // Handle known error cases
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return reply.status(409).send({
          success: false,
          error: {
            message: 'This email is already on the waitlist',
            code: 'EMAIL_ALREADY_EXISTS',
          },
        });
      }
      
      // Log unexpected errors
      console.error('Unexpected error in joinWaitlist:', error);
      
      // Return generic error response
      return reply.status(500).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    }
  }

  /**
   * Get waitlist stats (admin only)
   */
  static async getWaitlistStats(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const stats = await WaitlistService.getWaitlistStats();
      return reply.send(stats);
    } catch (error) {
      console.error('Error getting waitlist stats:', error);
      return reply.status(500).send({
        success: false,
        error: {
          message: 'Failed to get waitlist stats',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    }
  }
}
