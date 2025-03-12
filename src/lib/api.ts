
import axios from 'axios';

// Configure API URL based on environment
const API_URL = import.meta.env.DEV 
  ? '/api'  // Development - use relative path with proxy
  : '/api'; // Production - relative path

export interface Book {
  id: string;
  name: string;
  genre: string;
  url: string;
  externalUrl?: string;
  coverImage?: string;
  description?: string;
}

export const fetchBooks = async (): Promise<Book[]> => {
  try {
    const response = await axios.get(`${API_URL}/books`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error; // Propagate error to caller
  }
};

export const fetchBook = async (id: string): Promise<Book | null> => {
  try {
    const response = await axios.get(`${API_URL}/books/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book ${id}:`, error);
    throw error; // Propagate error to caller
  }
};

export const addBook = async (bookData: FormData): Promise<Book> => {
  try {
    const response = await axios.post(`${API_URL}/books`, bookData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error; // Propagate error to caller
  }
};

export const fetchBookContent = async (id: string): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/books/${id}/content`);
    return response.data.content;
  } catch (error) {
    console.error(`Error fetching book content for ${id}:`, error);
    throw error; // Propagate error to caller
  }
};
