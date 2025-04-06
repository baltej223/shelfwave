
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBook } from '../lib/api';
import BookReader from '../components/BookReader';
import { Loader, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

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
          
          // For Supabase URLs that contain the storage path pattern
          if (bookData.url.includes('supabase.co/storage/v1/object/public/book_files')) {
            try {
              // Extract the path from the URL to check if the file exists
              const urlParts = bookData.url.split('public/book_files/');
              if (urlParts.length > 1) {
                const filePath = urlParts[1];
                console.log("Checking if file exists in storage:", filePath);
                
                // Get a signed URL for the file instead of using the public URL
                const { data, error: signUrlError } = await supabase
                  .storage
                  .from('book_files')
                  .createSignedUrl(filePath, 60 * 60 * 24); // 24 hour expiry
                
                if (signUrlError) {
                  console.error("Storage error:", signUrlError);
                  setError('The book file could not be found in storage. The file may have been deleted or the storage bucket may not be properly configured.');
                  toast({
                    title: "Storage Error",
                    description: "Book file not accessible.",
                    variant: "destructive"
                  });
                  setLoading(false);
                  return;
                }
                
                // Use the signed URL
                if (data && data.signedUrl) {
                  console.log("Using signed URL:", data.signedUrl);
                  setBookUrl(data.signedUrl);
                } else {
                  setError('Could not generate a signed URL for this book file.');
                  toast({
                    title: "Error",
                    description: "Unable to access book file.",
                    variant: "destructive"
                  });
                }
              } else {
                // Fallback to using the original URL
                setBookUrl(bookData.url);
              }
            } catch (error: any) {
              console.error("Error checking book URL:", error);
              
              if (error.toString().includes("Bucket not found")) {
                setError('The storage bucket "book_files" was not found or is not properly configured. Please contact the administrator.');
                toast({
                  title: "Storage Error",
                  description: "Storage bucket not found or not properly configured.",
                  variant: "destructive"
                });
              } else {
                setError(`Error accessing book file: ${error.message || error}`);
                toast({
                  title: "Error",
                  description: "Failed to access book file.",
                  variant: "destructive"
                });
              }
              setLoading(false);
              return;
            }
          } else {
            // For non-Supabase URLs, use as-is
            setBookUrl(bookData.url);
          }
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
        toast({
          title: "Error",
          description: "Failed to load book data",
          variant: "destructive"
        });
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
