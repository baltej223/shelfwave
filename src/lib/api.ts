import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: string;
  name: string;
  genre: string;
  url?: string;
  externalUrl?: string;
  coverImage?: string;
  description?: string;
}

export const fetchBooks = async (): Promise<Book[]> => {
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }

  // Transform the data into the expected Book format
  return books.map(book => ({
    id: book.id,
    name: book.name,
    genre: book.genre,
    url: book.book_file_url,
    externalUrl: book.external_url,
    coverImage: book.cover_image_url,
    description: book.description
  }));
};

export const fetchBook = async (id: string): Promise<Book | null> => {
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching book ${id}:`, error);
    throw error;
  }

  if (!book) return null;

  // For book_file_url, create a signed URL if it exists
  let bookFileUrl = book.book_file_url;
  
  if (bookFileUrl && bookFileUrl.includes('supabase.co/storage/v1/object/public/book_files')) {
    try {
      // Extract the path from the public URL
      const pathParts = bookFileUrl.split('public/book_files/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        // Create a signed URL with 24 hour expiry
        const { data } = await supabase
          .storage
          .from('book_files')
          .createSignedUrl(filePath, 60 * 60 * 24);
          
        if (data && data.signedUrl) {
          bookFileUrl = data.signedUrl;
        }
      }
    } catch (err) {
      console.warn("Could not create signed URL for book file:", err);
      // Keep the original URL if signed URL creation fails
    }
  }

  return {
    id: book.id,
    name: book.name,
    genre: book.genre,
    url: bookFileUrl,
    externalUrl: book.external_url,
    coverImage: book.cover_image_url,
    description: book.description
  };
};

export const addBook = async (formData: FormData): Promise<Book> => {
  const name = formData.get('name') as string;
  const genre = formData.get('genre') as string;
  const description = formData.get('description') as string;
  const bookFile = formData.get('bookFile') as File;
  const coverImage = formData.get('coverImage') as File;
  const bookUrl = formData.get('bookUrl') as string;

  try {
    // Get the user's ID to create user-specific storage paths
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const userId = user.id;
    
    // Create the book record first to get the ID
    const { data: book, error } = await supabase
      .from('books')
      .insert({
        name,
        genre,
        description,
        external_url: bookUrl || null,
        user_id: userId // Add user_id field to the record
      })
      .select()
      .single();

    if (error) throw error;
    if (!book) throw new Error('Failed to create book record');

    const bookId = book.id;
    let bookFileUrl = null;
    let coverImageUrl = null;
    
    // Check if the book_files bucket exists before attempting upload
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw new Error('Could not access storage buckets');
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'book_files');
    if (!bucketExists) {
      console.error('The book_files bucket does not exist');
      throw new Error('Storage bucket "book_files" does not exist');
    }
    
    // Upload book file if provided
    if (bookFile && bookFile.size > 0) {
      const fileExt = bookFile.name.split('.').pop();
      const filePath = `${userId}/${bookId}/book.${fileExt}`;
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('book_files')
        .upload(filePath, bookFile, {
          contentType: bookFile.type,
          upsert: true
        });
      
      if (fileError) throw fileError;
      
      // Get a signed URL for the file
      try {
        const { data } = await supabase.storage
          .from('book_files')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 day expiry
        
        if (data && data.signedUrl) {
          bookFileUrl = data.signedUrl;
        } else {
          // Fallback to public URL
          const { data: publicUrlData } = supabase.storage
            .from('book_files')
            .getPublicUrl(filePath);
          
          bookFileUrl = publicUrlData.publicUrl;
        }
      } catch (urlError) {
        console.error('Error getting signed URL for book file:', urlError);
        // Fallback to public URL as a last resort
        const { data: publicUrlData } = supabase.storage
          .from('book_files')
          .getPublicUrl(filePath);
        
        bookFileUrl = publicUrlData.publicUrl;
      }
    }
    
    // Upload cover image if provided
    if (coverImage && coverImage.size > 0) {
      const imageExt = coverImage.name.split('.').pop();
      const imagePath = `${userId}/${bookId}/cover.${imageExt}`;
      
      const { data: imageData, error: imageError } = await supabase.storage
        .from('book_files')
        .upload(imagePath, coverImage, {
          contentType: coverImage.type,
          upsert: true
        });
      
      if (imageError) throw imageError;
      
      // Get the public URL for the image
      const { data } = supabase.storage
        .from('book_files')
        .getPublicUrl(imagePath);
      
      coverImageUrl = data.publicUrl;
    }
    
    // Update the book record with the file URLs
    const { data: updatedBook, error: updateError } = await supabase
      .from('books')
      .update({
        book_file_url: bookFileUrl,
        cover_image_url: coverImageUrl
      })
      .eq('id', bookId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    if (!updatedBook) throw new Error('Failed to update book record');
    
    return {
      id: updatedBook.id,
      name: updatedBook.name,
      genre: updatedBook.genre,
      url: updatedBook.book_file_url,
      externalUrl: updatedBook.external_url,
      coverImage: updatedBook.cover_image_url,
      description: updatedBook.description
    };
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const fetchBookContent = async (id: string): Promise<string> => {
  const { data: book, error } = await supabase
    .from('books')
    .select('description')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching book content for ${id}:`, error);
    throw error;
  }

  return book?.description || '';
};

export const deleteBook = async (id: string): Promise<void> => {
  try {
    // Get book data to check for file URLs
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error(`Error fetching book ${id} for deletion:`, fetchError);
      throw fetchError;
    }

    // Check if we have files to delete in storage
    const { data: { user } } = await supabase.auth.getUser();
    if (user && (book.book_file_url || book.cover_image_url)) {
      try {
        const userId = user.id;
        const storagePath = `${userId}/${id}`;
        
        // Delete all files in the book's folder
        const { data: storageFiles, error: storageError } = await supabase
          .storage
          .from('book_files')
          .list(storagePath);
          
        if (!storageError && storageFiles && storageFiles.length > 0) {
          const filesToRemove = storageFiles.map(file => `${storagePath}/${file.name}`);
          
          await supabase
            .storage
            .from('book_files')
            .remove(filesToRemove);
        }
      } catch (storageDeleteError) {
        console.error('Error deleting storage files:', storageDeleteError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the book from the database
    const { error: deleteError } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error(`Error deleting book ${id}:`, deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('Error in deleteBook:', error);
    throw error;
  }
};
