import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X, Menu, Loader, ChevronLeft, ChevronRight, Maximize, Minimize, BookOpen, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "../hooks/use-toast";

interface BookReaderProps {
  bookUrl: string;
  bookName: string;
  onClose: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({ bookUrl, bookName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isExternalUrl, setIsExternalUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the URL is external (starts with http)
    setIsExternalUrl(bookUrl?.startsWith('http') || false);
    
    // Reset any previous errors and loading state
    setError(null);
    setLoading(true);
    setIframeLoaded(false);
    
    // Validate the bookUrl
    if (!bookUrl) {
      setError('Book source not available');
      setLoading(false);
      toast({
        title: "Error",
        description: "Unable to load book: Source not available",
        variant: "destructive"
      });
      return;
    }
    
    // Check if the bookUrl points to a Supabase storage and verify it exists
    if (bookUrl.includes('supabase') && !bookUrl.startsWith('http')) {
      fetch(bookUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            console.error("Book file access error:", response.status);
            if (response.status === 404) {
              throw new Error('Storage bucket not found or file does not exist');
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response;
        })
        .catch(error => {
          console.error("Error checking book URL:", error);
          setError('The book file could not be accessed. The storage bucket might be missing or the file has been deleted.');
          toast({
            title: "Error",
            description: "Book file not accessible. Check that the storage bucket exists.",
            variant: "destructive"
          });
          setLoading(false);
        });
    }
    
    // Set a mock total pages count for the reader
    setTotalPages(Math.floor(Math.random() * 100) + 30);
    
    // Simulate loading the book with a timeout
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [bookName, bookUrl, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreen) {
          setFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, fullscreen]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      toast({
        title: "Previous page",
        description: `Page ${currentPage - 1}`,
        duration: 1500,
      });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      toast({
        title: "Next page",
        description: `Page ${currentPage + 1}`,
        duration: 1500,
      });
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    }, 100);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // URL Safety check - make sure we have a valid URL to display
  const getSafeUrl = () => {
    if (!bookUrl) return '';
    
    if (bookUrl.startsWith('http')) {
      return bookUrl;
    } else if (bookUrl.startsWith('data:')) {
      return bookUrl;
    } else {
      // For relative URLs, make sure they start with a slash
      return `${window.location.origin}${bookUrl.startsWith('/') ? '' : '/'}${bookUrl}`;
    }
  };

  // Get safe URL for iframe
  const safeUrl = getSafeUrl();

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    toast({
      title: "Book loaded",
      description: "Enjoy reading " + bookName,
    });
  };

  const handleIframeError = () => {
    setError('Failed to load book content');
    setIframeLoaded(false);
    toast({
      title: "Error",
      description: "Failed to load book content. The file may be inaccessible or in an unsupported format.",
      variant: "destructive"
    });
  };

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

  if (error || !safeUrl) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full mx-auto mb-6 w-16 h-16 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium mb-2">Unable to Load Book</h3>
          <p className="text-muted-foreground mb-6">
            {error || "The book source is unavailable. Please try again later or contact support."}
          </p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Back to Book Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`fixed inset-0 bg-background z-50 flex flex-col ${fullscreen ? 'bg-black' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Reader Header */}
      {showControls && (
        <motion.div 
          className={`flex items-center justify-between p-4 ${fullscreen ? 'bg-black text-white border-gray-800' : 'border-b'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
              onClick={zoomOut}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={isExternalUrl}
            >
              <Minimize className="h-5 w-5" />
            </button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <button 
              onClick={zoomIn}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={isExternalUrl}
            >
              <Maximize className="h-5 w-5" />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Reader Content */}
      <div 
        className="flex-1 flex relative"
        onMouseMove={() => !showControls && setShowControls(true)}
      >
        {/* Page Turn Buttons - Left */}
        {!isExternalUrl && iframeLoaded && (
          <div className="absolute left-0 inset-y-0 flex items-center z-10">
            <button 
              onClick={handlePrevPage}
              className="h-16 w-16 -ml-8 hover:ml-0 transition-all bg-gray-200/80 hover:bg-gray-300/90 text-gray-800 rounded-r-full flex items-center justify-end pr-4"
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          </div>
        )}

        {/* Book Content */}
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden"
          onClick={() => setShowControls(!showControls)}
        >
          {!loading && !error && (
            <iframe 
              ref={iframeRef}
              src={safeUrl} 
              title={bookName}
              className="w-full h-full transition-transform duration-300"
              style={{ 
                border: 'none',
                transform: isExternalUrl ? 'none' : `scale(${scale})`,
                boxShadow: fullscreen ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
                visibility: iframeLoaded || isExternalUrl ? 'visible' : 'hidden'
              }}
              sandbox={isExternalUrl ? "allow-scripts allow-same-origin allow-forms" : "allow-same-origin allow-scripts"}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
          
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center">
                <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium">Loading book...</h3>
                <p className="text-muted-foreground">Preparing your reading experience</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center max-w-md p-6">
                <div className="bg-destructive/10 p-4 rounded-full mx-auto mb-6 w-16 h-16 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-medium mb-2">Unable to Load Book</h3>
                <p className="text-muted-foreground mb-6">
                  {error || "The book source is unavailable. Please try again later or contact support."}
                </p>
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Back to Book Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Page Turn Buttons - Right */}
        {!isExternalUrl && iframeLoaded && (
          <div className="absolute right-0 inset-y-0 flex items-center z-10">
            <button 
              onClick={handleNextPage}
              className="h-16 w-16 -mr-8 hover:mr-0 transition-all bg-gray-200/80 hover:bg-gray-300/90 text-gray-800 rounded-l-full flex items-center justify-start pl-4"
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        )}
      </div>
      
      {/* Reader Footer */}
      {showControls && !isExternalUrl && iframeLoaded && (
        <motion.div 
          className={`p-4 ${fullscreen ? 'bg-black text-white border-gray-800' : 'border-t'} flex items-center justify-between`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-800"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>
          
          <button 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-800"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookReader;
