import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ReceiptTemplate, ReceiptField } from './crawler.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getModel() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

export async function editTemplateWithAI(
  template: ReceiptTemplate,
  userPrompt: string
): Promise<{ updatedFields: ReceiptField[]; explanation: string }> {
  const model = getModel();

  const systemPrompt = `You are a receipt template editor AI. The user has a receipt template with specific fields and values. 
They will describe changes they want to make in natural language. You must return the updated fields as a JSON array.

Current template: "${template.name}" (${template.category})

Current fields:
${JSON.stringify(template.fields, null, 2)}

Rules:
1. Return valid JSON with exactly two keys: "updatedFields" (array of field objects) and "explanation" (string describing what changed).
2. Each field object must have: key (string), label (string), value (string), type ("text" | "number" | "date" | "currency").
3. You can modify existing fields, add new fields, or remove fields based on the user's request.
4. When adding items, follow the existing naming convention (e.g., item1, item2, item3...).
5. When changing prices, recalculate subtotals, tax, and totals accordingly.
6. Keep the response focused on the changes requested.
7. Return ALL fields (not just changed ones) so the complete template can be re-rendered.
8. For currency values, return just the number as a string (e.g., "29.99" not "$29.99").
9. ONLY return the JSON object. No markdown, no code blocks, no extra text.`;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: `User request: ${userPrompt}` },
  ]);

  const responseText = result.response.text().trim();

  let cleanedText = responseText;
  if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(cleanedText) as {
      updatedFields: ReceiptField[];
      explanation: string;
    };

    if (!Array.isArray(parsed.updatedFields)) {
      throw new Error('Invalid response: updatedFields must be an array');
    }

    return parsed;
  } catch (parseError) {
    const fieldArrayMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (fieldArrayMatch) {
      const fields = JSON.parse(fieldArrayMatch[0]) as ReceiptField[];
      return {
        updatedFields: fields,
        explanation: 'Template updated based on your request.',
      };
    }
    throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
  }
}

export async function generateTemplateFromDescription(
  description: string
): Promise<{ fields: ReceiptField[]; name: string; category: string }> {
  const model = getModel();

  const prompt = `Generate a receipt template based on this description: "${description}"

Return a JSON object with:
- "name": A descriptive name for the template
- "category": A category (e.g., "Retail", "Restaurant", "Service", "Medical", etc.)
- "fields": An array of field objects, each with:
  - "key": camelCase identifier
  - "label": Human-readable label
  - "value": A realistic sample value
  - "type": "text" | "number" | "date" | "currency"

Make the receipt realistic with proper formatting. Include store info, items, subtotal, tax, and total.
ONLY return the JSON object. No markdown, no code blocks, no extra text.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  let cleanedText = responseText;
  if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(cleanedText) as {
    fields: ReceiptField[];
    name: string;
    category: string;
  };

  return parsed;
}
