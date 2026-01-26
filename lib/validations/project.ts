import { z } from 'zod';

/**
 * Project creation validation schema
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(200, 'Project name must not exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  client_name: z
    .string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must not exceed 100 characters'),
  status: z
    .enum(['planning', 'in_progress', 'review', 'completed', 'on_hold'])
    .default('planning'),
  start_date: z
    .string()
    .datetime('Invalid start date format'),
  deadline: z
    .string()
    .datetime('Invalid deadline format')
    .optional(),
  budget: z
    .number()
    .positive('Budget must be positive')
    .optional(),
  team_id: z
    .string()
    .uuid('Invalid team ID format')
    .optional()
});

/**
 * Project update validation schema
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(200, 'Project name must not exceed 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  status: z
    .enum(['planning', 'in_progress', 'review', 'completed', 'on_hold'])
    .optional(),
  deadline: z
    .string()
    .datetime('Invalid deadline format')
    .optional(),
  budget: z
    .number()
    .positive('Budget must be positive')
    .optional()
});

/**
 * Task creation validation schema
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Task title must be at least 3 characters')
    .max(200, 'Task title must not exceed 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: z
    .enum(['todo', 'in_progress', 'review', 'done'])
    .default('todo'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  project_id: z
    .string()
    .uuid('Invalid project ID format'),
  assigned_to: z
    .string()
    .uuid('Invalid user ID format')
    .optional(),
  due_date: z
    .string()
    .datetime('Invalid due date format')
    .optional()
});

/**
 * Task update validation schema
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Task title must be at least 3 characters')
    .max(200, 'Task title must not exceed 200 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: z
    .enum(['todo', 'in_progress', 'review', 'done'])
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .optional(),
  assigned_to: z
    .string()
    .uuid('Invalid user ID format')
    .optional(),
  due_date: z
    .string()
    .datetime('Invalid due date format')
    .optional()
});

// Export types
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
