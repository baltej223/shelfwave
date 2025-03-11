
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Book as BookIcon, FileText } from 'lucide-react';
import { Book } from '../lib/api';
import ReactMarkdown from 'react-markdown';

interface BookDetailViewProps {
  book: Book;
  description?: string;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ book, description }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    if (!book.url) return;
    
    setIsDownloading(true);
    
    const link = document.createElement('a');
    link.href = book.url;
    link.setAttribute('download', book.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsDownloading(false), 1000);
  };
  
  const isLocalFile = book.url && !book.url.startsWith('http');

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
          
          {book.url && (
            <motion.button
              onClick={handleDownload}
              className="mt-6 w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>{isLocalFile ? "Open Book" : "Download"}</span>
                </>
              )}
            </motion.button>
          )}
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
