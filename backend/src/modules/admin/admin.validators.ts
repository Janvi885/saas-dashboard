import { z } from 'zod'

export const setRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(['admin', 'viewer']),
})

export type SetRoleInput = z.infer<typeof setRoleSchema>
