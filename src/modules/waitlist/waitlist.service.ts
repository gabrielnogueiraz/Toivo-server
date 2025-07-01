import { FastifyRequest } from "fastify";
import { sendWaitlistConfirmationEmail } from "../../utils/email.js";
import { JoinWaitlistInput } from "./waitlist.schema.js";
import { WaitlistRepository } from "./waitlist.repository.js";

export class WaitlistService {
  static async joinWaitlist(data: JoinWaitlistInput, ipAddress?: string) {
    try {
      const waitlistEntry = await WaitlistRepository.addToWaitlist({
        email: data.email,
        ipAddress,
      });

      this.sendConfirmationEmail(data.email).catch((error) => {
        console.error("Falha ao enviar e-mail de confirmação:", error);
      });

      return {
        success: true,
        message: "Successfully joined the waitlist!",
        data: {
          email: waitlistEntry.email,
          createdAt: waitlistEntry.created_at.toISOString(),
        },
      };
    } catch (error: any) {
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return {
          success: false,
          error: {
            message: "This email is already on the waitlist",
            code: "EMAIL_ALREADY_EXISTS",
          },
        };
      }

      console.error("Error joining waitlist:", error);
      throw new Error("Failed to join waitlist");
    }
  }

  private static async sendConfirmationEmail(email: string) {
    try {
      await sendWaitlistConfirmationEmail(email);
      console.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send confirmation email to ${email}:`, error);
      throw error;
    }
  }

  static async getWaitlistStats() {
    try {
      const [count, { data: emails }] = await Promise.all([
        WaitlistRepository.getWaitlistCount(),
        WaitlistRepository.getWaitlistEmails({ limit: 1000 }) // Ajuste o limite conforme necessário
      ]);

      return {
        success: true,
        data: {
          count,
          lastUpdated: new Date().toISOString(),
          emails: emails.map(email => ({
            ...email,
            created_at: email.created_at.toISOString(),
          }))
        },
      };
    } catch (error) {
      console.error("Error getting waitlist stats:", error);
      throw new Error("Failed to get waitlist stats");
    }
  }

  static getClientIp(request: FastifyRequest): string | undefined {
    const forwarded = request.headers["x-forwarded-for"];
    if (forwarded && typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }

    return request.ip;
  }
}
