
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

  return {
    id: book.id,
    name: book.name,
    genre: book.genre,
    url: book.book_file_url,
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
        external_url: bookUrl || null
      })
      .select()
      .single();

    if (error) throw error;
    if (!book) throw new Error('Failed to create book record');

    const bookId = book.id;
    let bookFileUrl = null;
    let coverImageUrl = null;
    
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
      
      const { data: { publicUrl } } = supabase.storage
        .from('book_files')
        .getPublicUrl(filePath);
      
      bookFileUrl = publicUrl;
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
      
      const { data: { publicUrl } } = supabase.storage
        .from('book_files')
        .getPublicUrl(imagePath);
      
      coverImageUrl = publicUrl;
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
