import { NextResponse } from 'next/server';
import { z, ZodError, ZodIssue } from 'zod';

/**
 * Validates request body against a Zod schema
 * Returns parsed data if valid, or error response if invalid
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.Schema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: error.issues.map((err: ZodIssue) => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        )
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      )
    };
  }
}

/**
 * Formats Zod validation errors into a readable format
 */
export function formatZodError(error: ZodError) {
  return error.issues.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}
