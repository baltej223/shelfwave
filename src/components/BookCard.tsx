
import React from 'react';
import { motion } from 'framer-motion';
import { Book as BookIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Book } from '../lib/api';

interface BookCardProps {
  book: Book;
  index: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, index }) => {
  const randomColor = [
    'bg-blue-500', 
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-indigo-500',
    'bg-red-500',
  ][index % 7];

  return (
    <motion.div 
      className="relative h-64 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut" 
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <Link to={`/book/${book.id}`} className="block h-full w-full">
        {book.coverImage ? (
          <div className="h-full w-full relative">
            <img 
              src={book.coverImage} 
              alt={book.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
          </div>
        ) : (
          <div className={`h-full w-full flex items-center justify-center ${randomColor}`}>
            <BookIcon className="h-16 w-16 text-white" />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
          <div className="inline-block px-2 py-1 mb-2 text-xs rounded-full bg-primary/80 text-white backdrop-blur-sm">
            {book.genre}
          </div>
          <h3 className="text-lg font-medium text-white mb-1 line-clamp-1">{book.name}</h3>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
