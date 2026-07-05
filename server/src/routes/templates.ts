import { Router, type Request, type Response } from 'express';
import {
  getBuiltInTemplates,
  getTemplateById,
  renderTemplateHtml,
  crawlReceiptSites,
  type ReceiptTemplate,
  type ReceiptField,
} from '../services/crawler.js';
import { editTemplateWithAI, generateTemplateFromDescription } from '../services/ai.js';

const router = Router();

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

router.post('/templates/:id/edit', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { prompt, currentFields, template: templateFromBody } = req.body as {
      prompt: string;
      currentFields?: ReceiptField[];
      template?: ReceiptTemplate;
    };

    // Built-in templates are looked up server-side. AI-generated (custom-*)
    // templates only exist in client state, so fall back to the template
    // sent in the request body.
    const template = getTemplateById(req.params.id) ?? templateFromBody;
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const workingTemplate: ReceiptTemplate = currentFields
      ? { ...template, fields: currentFields }
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

router.post('/templates/generate', async (req: Request, res: Response) => {
  try {
    const { description } = req.body as { description: string };

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'Description is required' });
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
    const { template } = req.body as { template: ReceiptTemplate };
    if (!template) {
      res.status(400).json({ error: 'Template data is required' });
      return;
    }
    const html = renderTemplateHtml(template);
    res.json({ html });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: 'Failed to render template' });
  }
});

router.get('/crawl', async (_req: Request, res: Response) => {
  try {
    const results = await crawlReceiptSites();
    res.json({ results });
  } catch (error) {
    console.error('Crawl error:', error);
    res.status(500).json({ error: 'Failed to crawl sites' });
  }
});

export default router;
