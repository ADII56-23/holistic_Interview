import React, { useState, useEffect, useRef } from 'react';
import { Search, Book, User, Star, ArrowRight, Loader2, X } from 'lucide-react';
import axios from 'axios';
import BookReader from './BookReader';

interface BookType {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string;
  description: string;
  previewLink: string;
  averageRating?: number;
}

const Library: React.FC = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{ id: string; title: string } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const API_KEY = "AIzaSyBQiCVsEQpPW9JEb3jl2zZKsV_XsHCGwEA"; // Google API Key provided by user

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (query.length < 3) {
        setPredictions([]);
        return;
      }

      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5&key=${API_KEY}`
        );
        const items = response.data.items || [];
        const titles = items.map((item: any) => item.volumeInfo.title);
        setPredictions([...new Set(titles)] as string[]);
        setShowPredictions(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    };

    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setShowPredictions(false);
    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=12&key=${API_KEY}`
      );
      const items = response.data.items || [];
      const formattedBooks = items.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown Author'],
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover',
        description: item.volumeInfo.description || 'No description available.',
        previewLink: item.volumeInfo.previewLink || item.volumeInfo.infoLink,
        averageRating: item.volumeInfo.averageRating
      }));
      setBooks(formattedBooks);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      {/* Header section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Knowledge <span className="text-blue-600">Library</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Search and explore books of different authors to enhance your interview preparation.
        </p>
      </div>

      {/* Search Bar Section */}
      <div className="max-w-2xl mx-auto mb-16 relative" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[2rem] p-2 shadow-xl focus-within:border-blue-500 transition-all">
            <div className="pl-6 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setShowPredictions(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search by title, author, or topic..."
              className="w-full px-6 py-4 text-lg bg-transparent border-none focus:outline-none placeholder:text-slate-300 font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => handleSearch(query)}
              disabled={loading}
              className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </div>
        </div>

        {/* Predictions dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] border border-slate-100 shadow-2xl z-50 overflow-hidden py-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {predictions.map((title, index) => (
              <button
                key={index}
                onClick={() => handleSearch(title)}
                className="w-full px-8 py-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors group"
              >
                <Book className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                <span className="text-slate-700 font-medium truncate">{title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Books...</p>
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {books.map((book) => (
            <div
              key={book.id}
              className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="aspect-[2/3] w-full mb-6 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative shadow-inner">
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 gap-2">
                  <button
                    onClick={() => setSelectedBook({ id: book.id, title: book.title })}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Read Now
                  </button>
                  <a
                    href={book.previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 py-3 bg-white/20 backdrop-blur-md rounded-xl text-white font-bold text-sm border border-white/30 hover:bg-white/30 transition-all text-center flex items-center justify-center"
                    title="Open Externally"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center text-xs font-black text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="ml-1 uppercase tracking-tighter">4.8 Rating</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Arrival</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {book.title}
                </h3>

                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-4">
                  <User className="w-4 h-4" />
                  <span className="truncate">{book.authors.join(', ')}</span>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-2">
                  {book.description}
                </p>

                <div className="pt-6 mt-auto border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Digital Edition</span>
                  <a
                    href={book.previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : query === '' ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Book className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">Explore the digital shelf</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">Discover books about leadership, coding, design, and career growth.</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500 font-medium">No books found for "{query}". Try a different search.</p>
        </div>
      )}

      {/* Footer background element */}
      <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Build your expert path</h2>
            <p className="text-slate-400 font-medium">Continuous learning is the key to mastering your next interview.</p>
          </div>
          <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl active:scale-95 whitespace-nowrap">
            Explore Free Resources
          </button>
        </div>
      </div>

      {/* Book Reader Modal */}
      {selectedBook && (
        <BookReader
          bookId={selectedBook.id}
          title={selectedBook.title}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default Library;
