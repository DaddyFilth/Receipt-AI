export interface ReceiptField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'currency';
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  category: string;
  html: string;
  thumbnail: string;
  fields: ReceiptField[];
}

export interface CrawlResult {
  url: string;
  title: string;
  description: string;
  templateSnippets: string[];
}

const API_BASE = '/api';

export async function fetchTemplates(): Promise<ReceiptTemplate[]> {
  const res = await fetch(`${API_BASE}/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  const data = (await res.json()) as { templates: ReceiptTemplate[] };
  return data.templates;
}

export async function fetchTemplate(id: string): Promise<ReceiptTemplate> {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  if (!res.ok) throw new Error('Template not found');
  const data = (await res.json()) as { template: ReceiptTemplate };
  return data.template;
}

export async function editTemplate(
  id: string,
  prompt: string,
  currentFields?: ReceiptField[]
): Promise<{ fields: ReceiptField[]; html: string; explanation: string }> {
  const res = await fetch(`${API_BASE}/templates/${id}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, currentFields }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error || 'Failed to edit template');
  }
  return res.json() as Promise<{ fields: ReceiptField[]; html: string; explanation: string }>;
}

export async function generateTemplate(
  description: string
): Promise<ReceiptTemplate> {
  const res = await fetch(`${API_BASE}/templates/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error || 'Failed to generate template');
  }
  const data = (await res.json()) as { template: ReceiptTemplate };
  return data.template;
}

export async function renderTemplate(
  template: ReceiptTemplate
): Promise<string> {
  const res = await fetch(`${API_BASE}/templates/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template }),
  });
  if (!res.ok) throw new Error('Failed to render template');
  const data = (await res.json()) as { html: string };
  return data.html;
}

export async function crawlSites(): Promise<CrawlResult[]> {
  const res = await fetch(`${API_BASE}/crawl`);
  if (!res.ok) throw new Error('Failed to crawl sites');
  const data = (await res.json()) as { results: CrawlResult[] };
  return data.results;
}
