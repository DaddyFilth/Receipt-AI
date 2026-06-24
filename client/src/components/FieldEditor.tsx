import React from 'react';
import { Pencil } from 'lucide-react';
import type { ReceiptField } from '../utils/api';

interface FieldEditorProps {
  fields: ReceiptField[];
  onChange: (fields: ReceiptField[]) => void;
}

export default function FieldEditor({ fields, onChange }: FieldEditorProps) {
  const handleFieldChange = (index: number, value: string) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], value };
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Manual Editor</h3>
        </div>
      </div>
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.key} className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">
                {field.label}
              </label>
              <input
                type={field.type === 'currency' || field.type === 'number' ? 'text' : field.type}
                value={field.value}
                onChange={e => handleFieldChange(index, e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {field.type === 'currency' && (
                <span className="text-xs text-gray-400 w-4">$</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
