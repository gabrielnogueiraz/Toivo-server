import jwt from 'jsonwebtoken'
import { prisma } from '../config/db.config.js'

export interface LumiTokenPayload {
  userId: string
  email: string
  name: string
  iat?: number
  exp?: number
}

export class LumiTokenService {
  private readonly jwtSecret: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!
    
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET não configurado para integração com Lumi')
    }
  }

  /**
   * Gera token JWT compatível com a Lumi
   */
  generateLumiToken(user: {
    id: string
    email: string
    name: string
  }): string {
    const payload: LumiTokenPayload = {
      userId: user.id,  // Lumi espera 'userId', não 'id'
      email: user.email,
      name: user.name
    }

    return jwt.sign(
      payload,
      this.jwtSecret,
      {
        algorithm: 'HS256',    // Mesmo algoritmo da Lumi
        expiresIn: '1h',       // Mesmo tempo de expiração
        issuer: 'toivo',       // Identificar origem
        audience: 'lumi'       // Identificar destino
      }
    )
  }

  /**
   * Verifica se token é compatível com Lumi
   */
  verifyLumiToken(token: string): LumiTokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
        audience: 'lumi',
        issuer: 'toivo'
      }) as LumiTokenPayload
    } catch (error) {
      console.error('Erro ao verificar token da Lumi:', error)
      return null
    }
  }

  /**
   * Converte token do Toivo para token da Lumi
   */
  async convertToivoToLumiToken(toivoUserId: string): Promise<string | null> {
    try {
      // Buscar dados completos do usuário
      const user = await this.getUserById(toivoUserId)
      
      if (!user) {
        throw new Error(`Usuário ${toivoUserId} não encontrado`)
      }

      return this.generateLumiToken({
        id: user.id,
        email: user.email,
        name: user.name
      })
    } catch (error) {
      console.error('Erro ao converter token:', error)
      return null
    }
  }

  private async getUserById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: { 
          id: true, 
          email: true, 
          name: true 
        }
      })
    } catch (error) {
      console.error('Erro ao buscar usuário no banco:', error)
      return null
    }
  }
}

export const lumiTokenService = new LumiTokenService()
