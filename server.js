import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static('./')); // For serving the React app

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bookName = req.body.name.replace(/[^a-zA-Z0-9]/g, '_');
    const dir = path.join(__dirname, 'books', bookName);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    
    // For book files
    if (file.fieldname === 'bookFile') {
      cb(null, `book${ext}`);
    } 
    // For cover images
    else if (file.fieldname === 'coverImage') {
      cb(null, `cover${ext}`);
    }
    else {
      cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    }
  }
});

const upload = multer({ storage });

// Helper function to read book directories
function readBookDirectories() {
  const booksDir = path.join(__dirname, 'books');
  
  if (!fs.existsSync(booksDir)) {
    fs.mkdirSync(booksDir, { recursive: true });
    return [];
  }
  
  return fs.readdirSync(booksDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

// Helper to load book data from JSON
function loadBookData(bookFolder) {
  const jsonPath = path.join(__dirname, 'books', bookFolder, 'book.json');
  
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  
  try {
    const data = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading book data for ${bookFolder}:`, error);
    return null;
  }
}

// Helper to download file from URL
async function downloadFile(url, destination) {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(destination);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading file from ${url}:`, error);
    throw error;
  }
}

// API Routes
app.get('/api/books', (req, res) => {
  try {
    const bookFolders = readBookDirectories();
    const books = [];
    
    for (const folder of bookFolders) {
      const bookData = loadBookData(folder);
      
      if (bookData) {
        // Check if there's a cover image
        const coverPath = path.join(__dirname, 'books', folder, 'cover.jpg');
        const coverPathPNG = path.join(__dirname, 'books', folder, 'cover.png');
        
        let hasCover = false;
        let coverUrl = '';
        
        if (fs.existsSync(coverPath)) {
          hasCover = true;
          coverUrl = `/api/books/${bookData.id}/cover`;
        } else if (fs.existsSync(coverPathPNG)) {
          hasCover = true;
          coverUrl = `/api/books/${bookData.id}/cover`;
        }
        
        books.push({
          ...bookData,
          coverImage: hasCover ? coverUrl : undefined
        });
      }
    }
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.get('/api/books/:id', (req, res) => {
  try {
    const bookFolders = readBookDirectories();
    
    for (const folder of bookFolders) {
      const bookData = loadBookData(folder);
      
      if (bookData && bookData.id === req.params.id) {
        // Check if there's a cover image
        const coverPath = path.join(__dirname, 'books', folder, 'cover.jpg');
        const coverPathPNG = path.join(__dirname, 'books', folder, 'cover.png');
        
        let hasCover = false;
        let coverUrl = '';
        
        if (fs.existsSync(coverPath)) {
          hasCover = true;
          coverUrl = `/api/books/${bookData.id}/cover`;
        } else if (fs.existsSync(coverPathPNG)) {
          hasCover = true;
          coverUrl = `/api/books/${bookData.id}/cover`;
        }
        
        return res.json({
          ...bookData,
          coverImage: hasCover ? coverUrl : undefined
        });
      }
    }
    
    res.status(404).json({ error: 'Book not found' });
  } catch (error) {
    console.error(`Error fetching book ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

app.get('/api/books/:id/content', (req, res) => {
  try {
    const bookFolders = readBookDirectories();
    
    for (const folder of bookFolders) {
      const bookData = loadBookData(folder);
      
      if (bookData && bookData.id === req.params.id) {
        const aboutPath = path.join(__dirname, 'books', folder, 'aboutBook.md');
        
        if (fs.existsSync(aboutPath)) {
          const content = fs.readFileSync(aboutPath, 'utf8');
          return res.json({ content });
        } else {
          return res.json({ content: '' });
        }
      }
    }
    
    res.status(404).json({ error: 'Book not found' });
  } catch (error) {
    console.error(`Error fetching content for book ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch book content' });
  }
});

app.get('/api/books/:id/cover', (req, res) => {
  try {
    const bookFolders = readBookDirectories();
    
    for (const folder of bookFolders) {
      const bookData = loadBookData(folder);
      
      if (bookData && bookData.id === req.params.id) {
        const coverPath = path.join(__dirname, 'books', folder, 'cover.jpg');
        const coverPathPNG = path.join(__dirname, 'books', folder, 'cover.png');
        
        if (fs.existsSync(coverPath)) {
          return res.sendFile(coverPath);
        } else if (fs.existsSync(coverPathPNG)) {
          return res.sendFile(coverPathPNG);
        } else {
          return res.status(404).json({ error: 'Cover image not found' });
        }
      }
    }
    
    res.status(404).json({ error: 'Book not found' });
  } catch (error) {
    console.error(`Error fetching cover for book ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch book cover' });
  }
});

app.get('/api/books/:id/file', (req, res) => {
  try {
    const bookFolders = readBookDirectories();
    
    for (const folder of bookFolders) {
      const bookData = loadBookData(folder);
      
      if (bookData && bookData.id === req.params.id) {
        const bookDir = path.join(__dirname, 'books', folder);
        const files = fs.readdirSync(bookDir);
        
        // Find book file (pdf, epub, etc)
        const bookFile = files.find(file => 
          file.startsWith('book.') && 
          !file.endsWith('.json')
        );
        
        if (bookFile) {
          const filePath = path.join(bookDir, bookFile);
          return res.sendFile(filePath);
        } else {
          return res.status(404).json({ error: 'Book file not found' });
        }
      }
    }
    
    res.status(404).json({ error: 'Book not found' });
  } catch (error) {
    console.error(`Error fetching file for book ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch book file' });
  }
});

app.post('/api/books', upload.fields([
  { name: 'bookFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, genre, description, bookUrl } = req.body;
    
    if (!name || !genre) {
      return res.status(400).json({ error: 'Name and genre are required' });
    }
    
    // Either bookFile or bookUrl is required
    const hasBookFile = req.files && req.files['bookFile'] && req.files['bookFile'][0];
    if (!hasBookFile && !bookUrl) {
      return res.status(400).json({ error: 'Either book file or book URL is required' });
    }
    
    const bookId = uuidv4();
    const bookName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const bookDir = path.join(__dirname, 'books', bookName);
    
    // Ensure the directory exists
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }
    
    // If URL is provided, download the file
    if (bookUrl) {
      const fileExtension = path.extname(bookUrl) || '.pdf';
      const bookFilePath = path.join(bookDir, `book${fileExtension}`);
      
      try {
        await downloadFile(bookUrl, bookFilePath);
      } catch (error) {
        return res.status(400).json({ error: 'Failed to download book from URL' });
      }
    }
    
    // Create book JSON data
    const bookData = {
      id: bookId,
      name,
      genre,
      url: `/api/books/${bookId}/file`
    };
    
    // Write book.json
    fs.writeFileSync(
      path.join(bookDir, 'book.json'),
      JSON.stringify(bookData, null, 2)
    );
    
    // Write aboutBook.md
    fs.writeFileSync(
      path.join(bookDir, 'aboutBook.md'),
      description || `# ${name}\n\nNo description provided.`
    );
    
    res.status(201).json(bookData);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

