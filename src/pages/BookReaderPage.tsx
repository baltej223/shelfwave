
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBook } from '../lib/api';
import BookReader from '../components/BookReader';
import { Loader, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const BookReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bookUrl, setBookUrl] = useState<string | null>(null);
  const [bookName, setBookName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) {
        setError('Book ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const bookData = await fetchBook(id);
        
        if (!bookData) {
          setError('Book not found');
          toast({
            title: "Error",
            description: "Book not found",
            variant: "destructive"
          });
          return;
        }
        
        setBookName(bookData.name);
        
        // Check for either URL or externalUrl
        if (bookData.url) {
          console.log("Using book file URL:", bookData.url);
          setBookUrl(bookData.url);
        } else if (bookData.externalUrl) {
          console.log("Using external URL:", bookData.externalUrl);
          setBookUrl(bookData.externalUrl);
        } else {
          setError('No readable version of this book is available');
          toast({
            title: "Error",
            description: "This book does not have a readable version",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Error loading book:", err);
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  const handleClose = () => {
    navigate(`/book/${id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading book...</p>
      </div>
    );
  }

  if (error || !bookUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error || 'Book URL not available'}</p>
        <button 
          onClick={() => navigate(`/book/${id}`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Back to Book Details
        </button>
      </div>
    );
  }

  return <BookReader bookUrl={bookUrl} bookName={bookName} onClose={handleClose} />;
};

export default BookReaderPage;
