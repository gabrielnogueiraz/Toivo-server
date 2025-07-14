import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { lumiTokenService } from '../services/lumiTokenService.js'

// Schemas Zod para validação
const lumiTokenRequestSchema = z.object({
  refresh: z.boolean().optional().default(false)
})

const validateTokenRequestSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório')
})

export interface LumiTokenRequest {
  Body?: {
    refresh?: boolean
  }
}

export async function lumiAuthRoutes(fastify: FastifyInstance) {
  
  /**
   * Gera token JWT compatível com a Lumi
   * Requer autenticação prévia no Toivo
   */
  fastify.post<LumiTokenRequest>('/auth/lumi-token', {
    preHandler: [fastify.authenticate], // Middleware de auth do Toivo
    schema: {
      description: 'Gera token JWT compatível com sistema Lumi',
      tags: ['Auth', 'Lumi'],
      summary: 'Conversão de token Toivo para Lumi',
      body: lumiTokenRequestSchema
    },
  }, async (request: FastifyRequest<LumiTokenRequest>, reply: FastifyReply) => {
    try {
      // Extrair dados do usuário autenticado (do middleware do Toivo)
      const user = (request as any).user
      
      if (!user || !user.id) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Usuário não autenticado no Toivo'
        })
      }

      // Gerar token compatível com Lumi
      const lumiToken = await lumiTokenService.convertToivoToLumiToken(user.id)

      if (!lumiToken) {
        return reply.status(500).send({
          error: 'Token Generation Failed',
          message: 'Erro ao gerar token para Lumi'
        })
      }

      // Log para debugging
      console.log(`🔄 Token Lumi gerado para usuário ${user.id} (${user.name})`)

      return reply.send({
        success: true,
        token: lumiToken,
        expiresIn: 3600, // 1 hora em segundos
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })

    } catch (error: any) {
      console.error('❌ Erro no endpoint /auth/lumi-token:', error)
      
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Erro interno ao gerar token da Lumi'
      })
    }
  })

  /**
   * Valida se token é compatível com Lumi
   * Endpoint para debugging/testes
   */
  fastify.post('/auth/validate-lumi-token', {
    schema: {
      description: 'Valida token JWT da Lumi',
      tags: ['Auth', 'Lumi', 'Debug'],
      body: validateTokenRequestSchema
    },
  }, async (request: FastifyRequest<{
    Body: { token: string }
  }>, reply: FastifyReply) => {
    try {
      const { token } = request.body

      const payload = lumiTokenService.verifyLumiToken(token)

      if (!payload) {
        return reply.status(401).send({
          valid: false,
          error: 'Token inválido ou expirado'
        })
      }

      console.log(`✅ Token Lumi validado com sucesso para usuário ${payload.userId}`)

      return reply.send({
        valid: true,
        payload,
        algorithm: 'HS256',
        library: 'jsonwebtoken'
      })

    } catch (error: any) {
      console.error('❌ Erro ao validar token Lumi:', error)
      return reply.status(400).send({
        valid: false,
        error: error.message
      })
    }
  })
}
