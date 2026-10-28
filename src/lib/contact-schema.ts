import { z } from 'zod';

// Validación del formulario de contacto (la misma en el cliente y en la Server Action).
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().max(200),
  message: z.string().trim().min(10).max(2000),
});

export type ContactField = keyof z.infer<typeof contactSchema>;

export type ContactState =
  | { status: 'idle' }
  | { status: 'ok' }
  | { status: 'invalid'; fields: ContactField[] }
  | { status: 'rate_limited' }
  | { status: 'error' };

/** Campos con error, en el orden del formulario. */
export function invalidFields(values: unknown): ContactField[] {
  const result = contactSchema.safeParse(values);
  if (result.success) return [];
  const fields = new Set(result.error.issues.map((issue) => issue.path[0] as ContactField));
  return (['name', 'email', 'message'] as const).filter((f) => fields.has(f));
}
