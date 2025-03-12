
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Book as BookIcon, FileText, ExternalLink, BookOpen } from 'lucide-react';
import { Book } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface BookDetailViewProps {
  book: Book;
  description?: string;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ book, description }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  const handleDownload = () => {
    if (!book.url) return;
    
    setIsDownloading(true);
    
    if (book.externalUrl) {
      // For external URLs, open in a new tab
      window.open(book.externalUrl, '_blank');
      setTimeout(() => setIsDownloading(false), 500);
    } else {
      // For local files, download
      const link = document.createElement('a');
      link.href = book.url;
      link.setAttribute('download', book.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const handleReadOnline = () => {
    navigate(`/read/${book.id}`);
  };

  const handleOpenInNewTab = () => {
    if (book.url) {
      window.open(book.url, '_blank');
    }
  };
  
  const isExternalLink = book.externalUrl && book.externalUrl.startsWith('http');

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <motion.div 
          className="w-full md:w-1/3 flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookIcon className="h-24 w-24 text-white" />
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            {/* Download Button */}
            <motion.button
              onClick={handleDownload}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isDownloading || !book.url}
            >
              {isDownloading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isExternalLink ? (
                    <ExternalLink className="h-5 w-5" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  <span>{isExternalLink ? "Open Book" : "Download"}</span>
                </>
              )}
            </motion.button>

            {/* Read Online Button */}
            <motion.button
              onClick={handleReadOnline}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!book.url}
            >
              <BookOpen className="h-5 w-5" />
              <span>Read Online</span>
            </motion.button>

            {/* Open in New Tab Button */}
            <motion.button
              onClick={handleOpenInNewTab}
              className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!book.url}
            >
              <ExternalLink className="h-5 w-5" />
              <span>Open in New Tab</span>
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-secondary text-primary-foreground text-sm mb-4">
            {book.genre}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{book.name}</h1>
          
          <div className="mt-6 prose prose-sm md:prose-base max-w-none">
            {description ? (
              <ReactMarkdown>{description}</ReactMarkdown>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-40" />
                <p>No description available for this book.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookDetailView;
