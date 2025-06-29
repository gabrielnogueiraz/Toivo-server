import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { joinWaitlistSchema, WaitlistResponse } from './waitlist.schema.js';
import { WaitlistService } from './waitlist.service.js';

export class WaitlistController {
  /**
   * Join the waitlist with email only
   */
  static async joinWaitlist(
    request: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply
  ): Promise<WaitlistResponse> {
    try {
      // Validate request body
      const data = joinWaitlistSchema.parse(request.body);
      
      // Get client IP for rate limiting/analytics
      const ipAddress = request.ip || 
                       request.headers['x-forwarded-for'] as string || 
                       request.socket.remoteAddress;
      
      console.log('IP do cliente:', ipAddress);
      
      // Process the waitlist signup
      const result = await WaitlistService.joinWaitlist(data, ipAddress);
      
      // Return success response
      return reply.status(201).send(result);
    } catch (error: unknown) {
      console.error('Erro ao processar inscrição na lista de espera:', error);
      
      // Handle validation errors
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        const zodError = error as z.ZodError;
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Erro de validação',
            code: 'VALIDATION_ERROR',
            details: zodError.errors.map((err: z.ZodIssue) => ({
              path: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      
      // Handle known error cases
      if (error && typeof error === 'object' && 'message' in error && error.message === 'EMAIL_ALREADY_EXISTS') {
        return reply.status(409).send({
          success: false,
          error: {
            message: 'Este e-mail já está na lista de espera',
            code: 'EMAIL_ALREADY_EXISTS'
          }
        });
      }
      
      // Handle other errors
      console.error('Erro inesperado em joinWaitlist:', error);
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
