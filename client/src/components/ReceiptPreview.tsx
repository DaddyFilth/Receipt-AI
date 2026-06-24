import React, { useRef } from 'react';
import { Download, RotateCcw } from 'lucide-react';

interface ReceiptPreviewProps {
  html: string;
  templateName: string;
  onReset?: () => void;
}

export default function ReceiptPreview({ html, templateName, onReset }: ReceiptPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${templateName} - Receipt</title>
        <style>
          body { margin: 0; padding: 20px; display: flex; justify-content: center; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>
      <div className="p-8 bg-gray-100 min-h-[400px] flex items-start justify-center">
        <div
          ref={previewRef}
          className="bg-white shadow-xl rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
