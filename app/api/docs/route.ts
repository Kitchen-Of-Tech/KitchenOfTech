import { NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger/config';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Get OpenAPI/Swagger specification
 *     description: Returns the complete OpenAPI 3.0 specification for the Kitchen of Tech API
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: Successful response with OpenAPI spec
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
