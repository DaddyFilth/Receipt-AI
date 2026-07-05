import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getBuiltInTemplates,
  getTemplateById,
  renderTemplateHtml,
  crawlReceiptSites,
  type ReceiptTemplate,
  type ReceiptField,
} from '../services/crawler.js';
import { editTemplateWithAI, generateTemplateFromDescription } from '../services/ai.js';
import { receiptTemplateSchema } from '../schemas.js';

const router = Router();

// Limit expensive endpoints (AI calls, outbound crawling) to prevent abuse
// of the paid Gemini API and the server's outbound network access.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const crawlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many crawl requests, please try again later.' },
});

router.get('/templates', (_req: Request, res: Response) => {
  const templates = getBuiltInTemplates();
  res.json({ templates });
});

router.get('/templates/:id', (req: Request<{ id: string }>, res: Response) => {
  const template = getTemplateById(req.params.id);
  if (!template) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }
  res.json({ template });
});

router.post('/templates/:id/edit', aiLimiter, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { prompt, currentFields, template: templateFromBody } = req.body as {
      prompt: string;
      currentFields?: ReceiptField[];
      template?: unknown;
    };

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Built-in templates are looked up server-side. AI-generated (custom-*)
    // templates only exist in client state, so fall back to the validated
    // template sent in the request body.
    let bodyTemplate: ReceiptTemplate | undefined;
    if (templateFromBody !== undefined) {
      const parsed = receiptTemplateSchema.safeParse(templateFromBody);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid template data' });
        return;
      }
      bodyTemplate = parsed.data;
    }

    const template = getTemplateById(req.params.id) ?? bodyTemplate;
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    let validatedFields: ReceiptField[] | undefined;
    if (currentFields !== undefined) {
      const parsed = receiptTemplateSchema.shape.fields.safeParse(currentFields);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid field data' });
        return;
      }
      validatedFields = parsed.data;
    }

    const workingTemplate: ReceiptTemplate = validatedFields
      ? { ...template, fields: validatedFields }
      : template;

    const result = await editTemplateWithAI(workingTemplate, prompt);

    const updatedTemplate: ReceiptTemplate = {
      ...workingTemplate,
      fields: result.updatedFields,
    };
    const html = renderTemplateHtml(updatedTemplate);

    res.json({
      fields: result.updatedFields,
      html,
      explanation: result.explanation,
    });
  } catch (error) {
    console.error('AI edit error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process AI edit',
    });
  }
});

router.post('/templates/generate', aiLimiter, async (req: Request, res: Response) => {
  try {
    const { description } = req.body as { description: string };

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'Description is required' });
      return;
    }

    if (description.length > 2000) {
      res.status(400).json({ error: 'Description is too long' });
      return;
    }

    const result = await generateTemplateFromDescription(description);

    const template: ReceiptTemplate = {
      id: `custom-${Date.now()}`,
      name: result.name,
      source: 'AI Generated',
      sourceUrl: '',
      category: result.category,
      thumbnail: '',
      html: '',
      fields: result.fields,
    };
    template.html = renderTemplateHtml(template);

    res.json({ template });
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate template',
    });
  }
});

router.post('/templates/render', (req: Request, res: Response) => {
  try {
    const { template } = req.body as { template?: unknown };
    if (!template) {
      res.status(400).json({ error: 'Template data is required' });
      return;
    }
    const parsed = receiptTemplateSchema.safeParse(template);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid template data' });
      return;
    }
    const html = renderTemplateHtml(parsed.data);
    res.json({ html });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: 'Failed to render template' });
  }
});

router.get('/crawl', crawlLimiter, async (_req: Request, res: Response) => {
  try {
    const results = await crawlReceiptSites();
    res.json({ results });
  } catch (error) {
    console.error('Crawl error:', error);
    res.status(500).json({ error: 'Failed to crawl sites' });
  }
});

export default router;
