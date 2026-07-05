import React from 'react';
import DOMPurify from 'dompurify';
import { Receipt, Store, UtensilsCrossed, Building2, Fuel, Stethoscope, ShoppingCart } from 'lucide-react';
import type { ReceiptTemplate } from '../utils/api';

interface TemplateGalleryProps {
  templates: ReceiptTemplate[];
  onSelect: (template: ReceiptTemplate) => void;
  loading: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Retail: <Store className="w-6 h-6" />,
  Restaurant: <UtensilsCrossed className="w-6 h-6" />,
  Hotel: <Building2 className="w-6 h-6" />,
  'Gas Station': <Fuel className="w-6 h-6" />,
  Medical: <Stethoscope className="w-6 h-6" />,
  Grocery: <ShoppingCart className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  Retail: 'bg-blue-50 text-blue-700 border-blue-200',
  Restaurant: 'bg-orange-50 text-orange-700 border-orange-200',
  Hotel: 'bg-purple-50 text-purple-700 border-purple-200',
  'Gas Station': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Medical: 'bg-green-50 text-green-700 border-green-200',
  Grocery: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function TemplateGallery({ templates, onSelect, loading }: TemplateGalleryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 loading-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
            <div className="h-32 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(template => {
        const colorClass = categoryColors[template.category] || 'bg-gray-50 text-gray-700 border-gray-200';
        const icon = categoryIcons[template.category] || <Receipt className="w-6 h-6" />;

        return (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${colorClass}`}>
                {icon}
                {template.category}
              </div>
              <span className="text-xs text-gray-400">{template.source}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-gray-500">
              {template.fields.length} fields
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg overflow-hidden max-h-36">
              <div
                className="transform scale-50 origin-top-left"
                style={{ width: '200%' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(template.html) }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
