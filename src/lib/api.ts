
import axios from 'axios';

const API_URL = '/api';

export interface Book {
  id: string;
  name: string;
  genre: string;
  url: string;
  coverImage?: string;
  description?: string;
}

export const fetchBooks = async (): Promise<Book[]> => {
  try {
    const response = await axios.get(`${API_URL}/books`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

export const fetchBook = async (id: string): Promise<Book | null> => {
  try {
    const response = await axios.get(`${API_URL}/books/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book ${id}:`, error);
    return null;
  }
};

export const addBook = async (bookData: FormData): Promise<Book | null> => {
  try {
    const response = await axios.post(`${API_URL}/books`, bookData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding book:', error);
    return null;
  }
};

export const fetchBookContent = async (id: string): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/books/${id}/content`);
    return response.data.content;
  } catch (error) {
    console.error(`Error fetching book content for ${id}:`, error);
    return '';
  }
};
