
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchBooks, Book } from '../lib/api';
import BookCard from '../components/BookCard';
import { BookOpen, Loader } from 'lucide-react';

const Home: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchBooks();
        setBooks(data);
        setError(null);
      } catch (err) {
        setError('Failed to load books. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your bookshelf...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
          <BookOpen className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <BookOpen className="h-16 w-16 text-muted-foreground" />
        </motion.div>
        <h2 className="text-2xl font-medium mb-2">Your bookshelf is empty</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start building your collection by adding your first book.
        </p>
        <motion.a
          href="/add"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium"
        >
          Add Your First Book
        </motion.a>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <h1 className="text-3xl font-bold mb-2">Your Bookshelf</h1>
        <p className="text-muted-foreground">
          Your personal collection of {books.length} book{books.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {books.map((book, index) => (
          <BookCard key={book.id} book={book} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Home;
