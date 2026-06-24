import React, { useState } from 'react';
import { Globe, Search, Loader2, ExternalLink } from 'lucide-react';
import { crawlSites, type CrawlResult } from '../utils/api';

export default function CrawlPanel() {
  const [results, setResults] = useState<CrawlResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [crawled, setCrawled] = useState(false);

  const handleCrawl = async () => {
    setLoading(true);
    try {
      const data = await crawlSites();
      setResults(data);
      setCrawled(true);
    } catch (err) {
      console.error('Crawl failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-600" />
          <h3 className="text-sm font-medium text-gray-700">Web Crawler</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Discover receipt templates from across the web
        </p>
      </div>
      <div className="p-4">
        {!crawled ? (
          <button
            onClick={handleCrawl}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Crawling receipt template sites...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Crawl Web for Receipt Templates
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            {results.map((result, i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium text-gray-800">{result.title}</h4>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {result.description && (
                  <p className="text-xs text-gray-500 mt-1">{result.description}</p>
                )}
                {result.templateSnippets.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.templateSnippets.slice(0, 8).map((s, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 text-xs bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200"
                      >
                        {s.length > 40 ? s.slice(0, 37) + '...' : s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={handleCrawl}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              Re-crawl
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
