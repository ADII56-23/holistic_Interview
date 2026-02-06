import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, Maximize2, Minimize2, ChevronLeft } from 'lucide-react';

interface BookReaderProps {
  bookId: string;
  onClose: () => void;
  title: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const BookReader: React.FC<BookReaderProps> = ({ bookId, onClose, title }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const scriptId = 'google-books-api-script';

    const initViewer = () => {
      if (window.google && window.google.books) {
        window.google.books.load();
        window.google.books.setOnLoadCallback(() => {
          const viewer = new window.google.books.DefaultViewer(viewerRef.current);
          viewer.load(bookId, () => {
            setError("Failed to load book preview. This book might not support embedded viewing.");
            setLoading(false);
          }, () => {
            setLoading(false);
          });
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/books/jsapi.js';
      script.type = 'text/javascript';
      script.onload = () => {
        initViewer();
      };
      document.head.appendChild(script);
    } else {
      initViewer();
    }

    return () => {
      // We don't remove the script but we might want to clear the viewer
      if (viewerRef.current) {
        viewerRef.current.innerHTML = '';
      }
    };
  }, [bookId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-xl transition-all duration-500 ${isFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/10">

        {/* Header toolbar */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 truncate max-w-md">{title}</h2>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Digital Reader</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative bg-slate-50 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <p className="text-slate-900 font-bold text-lg">Initializing Reader...</p>
              <p className="text-slate-400 text-sm mt-1">Please wait while we prepare your book.</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <X className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Oops! Preview Unavailable</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                {error}
              </p>
              <button
                onClick={onClose}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl"
              >
                Go Back to Library
              </button>
            </div>
          )}

          <div
            ref={viewerRef}
            className="w-full h-full"
            style={{ display: loading || error ? 'none' : 'block' }}
          ></div>
        </div>

        {/* Footer info (optional) */}
        {!isFullscreen && (
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Powered by Google Books</span>
            <span>Interactive Preview</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReader;
