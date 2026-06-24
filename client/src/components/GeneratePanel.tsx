import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { generateTemplate, type ReceiptTemplate } from '../utils/api';

interface GeneratePanelProps {
  onGenerated: (template: ReceiptTemplate) => void;
}

export default function GeneratePanel({ onGenerated }: GeneratePanelProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || loading) return;

    setLoading(true);
    setError('');
    try {
      const template = await generateTemplate(description.trim());
      onGenerated(template);
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-medium text-gray-700">Generate Custom Template</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Describe any receipt type and AI will create it
        </p>
      </div>
      <form onSubmit={handleGenerate} className="p-4">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder='e.g., "A coffee shop receipt with specialty drinks, pastries, and a tip line"'
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          rows={3}
          disabled={loading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={!description.trim() || loading}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Receipt Template
            </>
          )}
        </button>
      </form>
    </div>
  );
}
