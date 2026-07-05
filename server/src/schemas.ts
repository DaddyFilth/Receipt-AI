import { z } from 'zod';

export const receiptFieldSchema = z.object({
  key: z.string().max(200),
  label: z.string().max(500),
  value: z.string().max(5000),
  type: z.enum(['text', 'number', 'date', 'currency']),
});

export const receiptTemplateSchema = z.object({
  id: z.string().max(200),
  name: z.string().max(500),
  source: z.string().max(500),
  sourceUrl: z.string().max(2000),
  category: z.string().max(200),
  html: z.string().max(100000),
  thumbnail: z.string().max(2000),
  fields: z.array(receiptFieldSchema).max(200),
});

export type ReceiptFieldInput = z.infer<typeof receiptFieldSchema>;
export type ReceiptTemplateInput = z.infer<typeof receiptTemplateSchema>;
