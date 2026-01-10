import { z } from "zod"

// User schemas - unified schema for both create and edit
export const userFormSchema = z.object({
  name: z.string().min(1, "Nama harus diisi").max(100, "Nama maksimal 100 karakter"),
  email: z.string().min(1, "Email harus diisi").email("Format email tidak valid"),
  password: z.string().min(12, "Password minimal 12 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung minimal 1 karakter spesial")
    .optional()
    .or(z.literal("")),
  roleUuid: z.string().min(1, "Role harus dipilih"),
  isActive: z.boolean(),
})

export type UserFormData = z.infer<typeof userFormSchema>

// Role schemas
export const createRoleSchema = z.object({
  name: z.string().min(1, "Nama role harus diisi").max(50, "Nama maksimal 50 karakter"),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").optional().or(z.literal("")),
  isActive: z.boolean(),
})

export const updateRoleSchema = createRoleSchema

export type CreateRoleFormData = z.infer<typeof createRoleSchema>
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>

// Menu schemas
export const createMenuSchema = z.object({
  name: z.string().min(1, "Nama menu harus diisi").max(50, "Nama maksimal 50 karakter"),
  path: z.string().max(100, "Path maksimal 100 karakter").optional().or(z.literal("")),
  icon: z.string().max(50, "Icon maksimal 50 karakter").optional().or(z.literal("")),
  order: z.number().int().min(0, "Order minimal 0"),
  isActive: z.boolean(),
  parentUuid: z.string().uuid("Parent menu tidak valid").optional().nullable(),
})

export const updateMenuSchema = createMenuSchema

export type CreateMenuFormData = z.infer<typeof createMenuSchema>
export type UpdateMenuFormData = z.infer<typeof updateMenuSchema>

// Auth schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email harus diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
})

export const registerSchema = z.object({
  name: z.string().min(1, "Nama harus diisi").max(100, "Nama maksimal 100 karakter"),
  email: z.string().min(1, "Email harus diisi").email("Format email tidak valid"),
  password: z.string().min(12, "Password minimal 12 karakter")
    .max(50, "Password maksimal 50 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung minimal 1 karakter spesial"),
  confirmPassword: z.string().min(1, "Konfirmasi password harus diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email harus diisi").email("Format email tidak valid"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(12, "Password minimal 12 karakter")
    .max(50, "Password maksimal 50 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung minimal 1 karakter spesial"),
  confirmPassword: z.string().min(1, "Konfirmasi password harus diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
