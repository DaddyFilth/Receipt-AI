import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface AiPromptBarProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
  explanation?: string;
}

const SUGGESTIONS = [
  'Change the store name to "Best Buy" and update the address',
  'Add a 15% discount on all items',
  'Change the date to today and add a new item: Coffee $4.99',
  'Make this a formal invoice with invoice number and due date',
  'Convert prices to euros and change location to Paris',
  'Add a loyalty rewards section with 500 points earned',
];

export default function AiPromptBar({ onSubmit, loading, explanation }: AiPromptBarProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSubmit(prompt.trim());
    setPrompt('');
  };

  const handleSuggestion = (suggestion: string) => {
    if (loading) return;
    onSubmit(suggestion);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-medium text-gray-700">AI Editor</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Describe changes in plain English — AI will update the receipt
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder='e.g., "Change the store name to Walmart and add a TV for $299"'
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? 'Editing...' : 'Apply'}
          </button>
        </div>
      </form>

      {explanation && (
        <div className="mx-4 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <span className="font-medium">AI:</span> {explanation}
          </p>
        </div>
      )}

      <div className="px-4 pb-4">
        <p className="text-xs text-gray-400 mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              disabled={loading}
              className="px-2.5 py-1 text-xs bg-gray-50 text-gray-600 rounded-full border border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 disabled:opacity-50 transition-colors"
            >
              {s.length > 50 ? s.slice(0, 47) + '...' : s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
