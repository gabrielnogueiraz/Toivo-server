import { z } from 'zod';

/**
 * Valida se uma string é um CUID, UUID ou ID da Lumi válido
 * @param value - String a ser validada
 * @returns boolean - true se for um CUID, UUID ou ID da Lumi válido
 */
export function isValidId(value: string): boolean {
  // CUID regex: c + 24 ou mais caracteres alfanuméricos minúsculos (versões diferentes do CUID)
  const cuidRegex = /^c[a-z0-9]{24,}$/;
  
  // UUID regex: formato padrão UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Lumi ID regex: formato usado pela Lumi (ex: board_1753203263828_zvh6v8eiy, task_timestamp_alphanumeric)
  const lumiIdRegex = /^[a-z]+_[0-9]+_[a-z0-9]+$/i;
  
  return cuidRegex.test(value) || uuidRegex.test(value) || lumiIdRegex.test(value);
}

/**
 * Schema de validação para IDs que aceita CUID, UUID ou IDs da Lumi
 * @param fieldName - Nome do campo para personalizar a mensagem de erro
 * @returns ZodString schema configurado
 */
export function createIdSchema(fieldName: string = 'ID') {
  return z.string()
    .min(1, `${fieldName} é obrigatório`)
    .refine(
      isValidId,
      { message: `${fieldName} deve ser um CUID, UUID ou ID válido` }
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
