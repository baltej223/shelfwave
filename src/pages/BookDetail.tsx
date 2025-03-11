
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBook, fetchBookContent, Book } from '../lib/api';
import BookDetailView from '../components/BookDetailView';
import { Loader, ArrowLeft, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [bookDescription, setBookDescription] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const bookData = await fetchBook(id);
        
        if (!bookData) {
          setError('Book not found');
          return;
        }
        
        setBook(bookData);
        
        // Fetch book description
        const description = await fetchBookContent(id);
        setBookDescription(description);
        
      } catch (err) {
        setError('Failed to load book details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error || 'Book not found'}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Back to Bookshelf
        </button>
      </div>
    );
  }

  return (
    <div>
      <motion.button
        onClick={() => navigate('/')}
        className="mb-8 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to bookshelf</span>
      </motion.button>
      
      <BookDetailView book={book} description={bookDescription} />
    </div>
  );
};

export default BookDetail;
