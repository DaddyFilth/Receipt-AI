import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, ArrowLeft, Sparkles } from 'lucide-react';
import TemplateGallery from './components/TemplateGallery';
import ReceiptPreview from './components/ReceiptPreview';
import AiPromptBar from './components/AiPromptBar';
import FieldEditor from './components/FieldEditor';
import CrawlPanel from './components/CrawlPanel';
import GeneratePanel from './components/GeneratePanel';
import {
  fetchTemplates,
  editTemplate,
  renderTemplate,
  type ReceiptTemplate,
  type ReceiptField,
} from './utils/api';

type View = 'gallery' | 'editor';

export default function App() {
  const [view, setView] = useState<View>('gallery');
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ReceiptTemplate | null>(null);
  const [currentFields, setCurrentFields] = useState<ReceiptField[]>([]);
  const [currentHtml, setCurrentHtml] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    fetchTemplates()
      .then(t => {
        setTemplates(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectTemplate = (template: ReceiptTemplate) => {
    setSelectedTemplate(template);
    setCurrentFields(template.fields);
    setCurrentHtml(template.html);
    setExplanation('');
    setView('editor');
  };

  const handleAiEdit = async (prompt: string) => {
    if (!selectedTemplate) return;
    setAiLoading(true);
    setExplanation('');
    try {
      const result = await editTemplate(selectedTemplate.id, prompt, currentFields, selectedTemplate);
      setCurrentFields(result.fields);
      setCurrentHtml(result.html);
      setExplanation(result.explanation);
    } catch (err) {
      setExplanation(
        `Error: ${err instanceof Error ? err.message : 'Failed to apply changes'}`
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleFieldChange = useCallback(
    async (fields: ReceiptField[]) => {
      setCurrentFields(fields);
      if (!selectedTemplate) return;
      try {
        const updatedTemplate: ReceiptTemplate = { ...selectedTemplate, fields };
        const html = await renderTemplate(updatedTemplate);
        setCurrentHtml(html);
      } catch {
        // Silently fail for render errors during typing
      }
    },
    [selectedTemplate]
  );

  const handleReset = () => {
    if (!selectedTemplate) return;
    setCurrentFields(selectedTemplate.fields);
    setCurrentHtml(selectedTemplate.html);
    setExplanation('');
  };

  const handleBack = () => {
    setView('gallery');
    setSelectedTemplate(null);
    setExplanation('');
  };

  const handleGenerated = (template: ReceiptTemplate) => {
    handleSelectTemplate(template);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {view === 'editor' && (
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Receipt AI</h1>
                  <p className="text-xs text-gray-500 -mt-0.5">Smart Template Editor</p>
                </div>
              </div>
            </div>
            {view === 'editor' && selectedTemplate && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Editing: <span className="font-medium text-gray-700">{selectedTemplate.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'gallery' ? (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                AI-Powered Receipt Template Editor
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Choose a template below, generate a custom one with AI, or crawl the web for
                inspiration. Edit any receipt using natural language prompts.
              </p>
            </div>

            {/* Generate + Crawl panels side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GeneratePanel onGenerated={handleGenerated} />
              <CrawlPanel />
            </div>

            {/* Template Gallery */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Receipt Templates
              </h3>
              <TemplateGallery
                templates={templates}
                onSelect={handleSelectTemplate}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Prompt Bar */}
            <AiPromptBar
              onSubmit={handleAiEdit}
              loading={aiLoading}
              explanation={explanation}
            />

            {/* Editor + Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FieldEditor
                fields={currentFields}
                onChange={handleFieldChange}
              />
              <ReceiptPreview
                html={currentHtml}
                templateName={selectedTemplate?.name || 'Receipt'}
                onReset={handleReset}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-400">
            Receipt AI &mdash; Powered by Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
