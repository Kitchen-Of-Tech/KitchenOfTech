import { z } from 'zod';

/**
 * Payment submission validation schema
 */
export const createPaymentSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum allowed'),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters (e.g., USD, EUR)')
    .toUpperCase()
    .default('USD'),
  payment_method: z
    .enum(['card', 'bank_transfer', 'paypal', 'crypto'])
    .refine((val) => ['card', 'bank_transfer', 'paypal', 'crypto'].includes(val), {
      message: 'Invalid payment method'
    }),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must not exceed 500 characters'),
  user_id: z
    .string()
    .uuid('Invalid user ID format'),
  metadata: z
    .record(z.string(), z.any())
    .optional()
});

/**
 * Payment approval/rejection validation schema
 */
export const updatePaymentStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_notes: z
    .string()
    .max(500, 'Admin notes must not exceed 500 characters')
    .optional()
});

/**
 * Invoice creation validation schema
 */
export const createInvoiceSchema = z.object({
  client_name: z
    .string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must not exceed 100 characters'),
  client_email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  client_address: z
    .string()
    .max(500, 'Address must not exceed 500 characters')
    .optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Item description is required'),
        quantity: z.number().positive('Quantity must be positive'),
        unit_price: z.number().positive('Unit price must be positive'),
        total: z.number().positive('Total must be positive')
      })
    )
    .min(1, 'At least one item is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  total: z.number().positive('Total must be positive'),
  due_date: z
    .string()
    .datetime('Invalid date format')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
});

/**
 * Payment link creation validation schema
 */
export const createPaymentLinkSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum allowed'),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters')
    .toUpperCase()
    .default('USD'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must not exceed 500 characters'),
  expires_at: z
    .string()
    .datetime('Invalid date format')
    .optional(),
  max_uses: z
    .number()
    .int('Max uses must be a whole number')
    .positive('Max uses must be positive')
    .optional()
});

// Export types
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreatePaymentLinkInput = z.infer<typeof createPaymentLinkSchema>;
