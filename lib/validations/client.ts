import { z } from 'zod';

export const clientStatusSchema = z.enum([
  'Initial',
  '1st Attack',
  'Fellows',
  'Attack Plan Done',
  'Replied',
  'Project Planning',
  'Project Revision',
  'Project Running',
  'Re Follow Up',
  'Cold',
  'Connected',
  'Re Cold',
  'Follow Up',
  'Black Listed',
  'Not Client',
  'Client',
]);

export const clientPossibilitySchema = z.enum(['High', 'Medium', 'Low']);

const mediaItemSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  dataUrl: z.string().min(1),
  size: z.number().optional(),
});

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url('Invalid social link URL'),
});

export const clientCreateSchema = z.object({
  client_status: clientStatusSchema,
  possibility: clientPossibilitySchema,
  client_name: z.string().min(2, 'Client name is required'),
  business_name: z.string().min(2, 'Business name is required'),
  client_description: z.string().optional(),
  client_business_type: z.string().optional(),
  client_found_from: z.string().optional(),
  client_media: z.array(mediaItemSchema).optional(),
  important_links: z.array(z.string().url()).optional(),
  social_links: z.array(socialLinkSchema).optional(),
  phone_numbers: z.array(z.string().min(3)).optional(),
  whatsapp_numbers: z.array(z.string().min(3)).optional(),
  imo_numbers: z.array(z.string().min(3)).optional(),
  emails: z.array(z.string().email()).optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  consultation_time_local: z.string().optional(),
  consultation_timezone: z.string().optional(),
  consultation_time_bdt: z.string().optional(),
  cold_email: z.string().optional(),
  cold_message: z.string().optional(),
  follow_up_emails: z.array(z.string()).optional(),
  follow_up_messages: z.array(z.string()).optional(),
  comment: z.string().optional(),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
