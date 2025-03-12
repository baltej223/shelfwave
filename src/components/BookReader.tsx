
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, X, Menu, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface BookReaderProps {
  bookUrl: string;
  bookName: string;
  onClose: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({ bookUrl, bookName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading the book
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium">Loading book...</h3>
          <p className="text-muted-foreground">Preparing your reading experience</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-background z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Reader Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="hidden sm:inline">Close Reader</span>
        </button>
        
        <h1 className="text-lg font-medium truncate max-w-[50%]">{bookName}</h1>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setFullscreen(!fullscreen)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Reader Content */}
      <div className="flex-1 flex">
        {/* Book Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <iframe 
            src={bookUrl} 
            title={bookName}
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
      </div>
      
      {/* Reader Footer */}
      <div className="p-4 border-t flex items-center justify-between">
        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="text-sm text-muted-foreground">
          Page 1 of 1
        </div>
        
        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default BookReader;
