import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Book as BookIcon, FileText, ExternalLink, BookOpen, Trash2 } from 'lucide-react';
import { Book, deleteBook } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookDetailViewProps {
  book: Book;
  description?: string;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ book, description }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const handleDownload = () => {
    if (!book.url && !book.externalUrl) {
      toast({
        title: "Error",
        description: "No download link available for this book",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      if (book.externalUrl) {
        window.open(book.externalUrl, '_blank');
        toast({
          title: "Success",
          description: "Opening book in a new tab",
        });
      } else if (book.url) {
        fetch(book.url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob();
          })
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', book.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast({
              title: "Success",
              description: "Book download started",
            });
          })
          .catch(error => {
            console.error("Download error:", error);
            toast({
              title: "Download failed",
              description: "The book file could not be accessed. It may have been deleted or the storage bucket might be missing.",
              variant: "destructive"
            });
          });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was a problem downloading the book",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const handleReadOnline = () => {
    if (!book.url && !book.externalUrl) {
      toast({
        title: "Error",
        description: "No link available to read this book",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/read/${book.id}`);
    toast({
      title: "Opening reader",
      description: `Loading ${book.name}`,
    });
  };

  const handleOpenInNewTab = () => {
    if (!book.url && !book.externalUrl) {
      toast({
        title: "Error",
        description: "No link available to open this book",
        variant: "destructive"
      });
      return;
    }
    
    const url = book.url || book.externalUrl;
    if (url) {
      if (url.includes('supabase') && !url.includes('http')) {
        toast({
          title: "Error opening book",
          description: "The book file could not be accessed. It may have been deleted or the storage bucket might be missing.",
          variant: "destructive"
        });
        return;
      }
      
      window.open(url, '_blank');
      toast({
        title: "Success",
        description: "Opening book in a new tab",
      });
    }
  };

  const handleDeleteBook = async () => {
    setIsDeleting(true);
    try {
      await deleteBook(book.id);
      toast({
        title: "Success",
        description: "Book has been deleted",
      });
      navigate('/', { state: { refresh: true } });
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the book",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookIcon className="h-24 w-24 text-white" />
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            <motion.button
              onClick={handleDownload}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isDownloading || (!book.url && !book.externalUrl)}
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

            <motion.button
              onClick={handleReadOnline}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!book.url && !book.externalUrl}
            >
              <BookOpen className="h-5 w-5" />
              <span>Read Online</span>
            </motion.button>

            <motion.button
              onClick={handleOpenInNewTab}
              className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!book.url && !book.externalUrl}
            >
              <ExternalLink className="h-5 w-5" />
              <span>Open in New Tab</span>
            </motion.button>

            <motion.button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full py-3 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none mt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Book</span>
                </>
              )}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{book.name}" from your bookshelf.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBook} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default BookDetailView;
