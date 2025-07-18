import { z } from 'zod';

/**
 * Valida se uma string é um CUID ou UUID válido
 * @param value - String a ser validada
 * @returns boolean - true se for um CUID ou UUID válido
 */
export function isValidId(value: string): boolean {
  // CUID regex: c + 24 ou mais caracteres alfanuméricos minúsculos (versões diferentes do CUID)
  const cuidRegex = /^c[a-z0-9]{24,}$/;
  
  // UUID regex: formato padrão UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  return cuidRegex.test(value) || uuidRegex.test(value);
}

/**
 * Schema de validação para IDs que aceita tanto CUID quanto UUID
 * @param fieldName - Nome do campo para personalizar a mensagem de erro
 * @returns ZodString schema configurado
 */
export function createIdSchema(fieldName: string = 'ID') {
  return z.string()
    .min(1, `${fieldName} é obrigatório`)
    .refine(
      isValidId,
      { message: `${fieldName} deve ser um CUID ou UUID válido` }
    );
}

/**
 * Schema para parâmetros de rota com ID
 */
export const idParamsSchema = z.object({
  id: createIdSchema('ID')
});

/**
 * Tipos inferidos
 */
export type IdParamsInput = z.infer<typeof idParamsSchema>;
