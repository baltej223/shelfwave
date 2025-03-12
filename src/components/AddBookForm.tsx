import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, X, BookIcon, FileText, Check, Link as LinkIcon } from 'lucide-react';
import { addBook } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AddBookForm: React.FC = () => {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [bookUrl, setBookUrl] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCoverPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookFile(e.target.files[0]);
      setBookUrl('');
    }
  };
  
  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };
  
  const removeBookFile = () => {
    setBookFile(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Book name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!genre.trim()) {
      toast({
        title: "Genre is required",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadMethod === 'file' && !bookFile) {
      toast({
        title: "Book file is required",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadMethod === 'url' && !bookUrl.trim()) {
      toast({
        title: "Book URL is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('genre', genre);
    formData.append('description', description);
    
    if (uploadMethod === 'file' && bookFile) {
      formData.append('bookFile', bookFile);
    } else if (uploadMethod === 'url') {
      formData.append('bookUrl', bookUrl);
    }
    
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    
    try {
      const result = await addBook(formData);
      
      toast({
        title: "Book added successfully",
        description: `${name} has been added to your library`,
      });
      
      setTimeout(() => {
        navigate('/', { state: { refresh: true } });
      }, 500);
      
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: "Failed to add book",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto py-8"
    >
      <h1 className="text-3xl font-bold mb-8">Add New Book</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="aspect-[2/3] rounded-lg border border-border overflow-hidden mb-4 relative">
              {coverPreview ? (
                <>
                  <img 
                    src={coverPreview} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover" 
                  />
                  <button 
                    type="button"
                    onClick={removeCover}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors text-muted-foreground">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Upload cover</span>
                  <span className="text-xs mt-1">JPG, PNG or GIF</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCoverChange}
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Book Title
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter book title"
              />
            </div>
            
            <div>
              <label htmlFor="genre" className="block text-sm font-medium mb-1">
                Genre
              </label>
              <input
                id="genre"
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="E.g., Fiction, Fantasy, Science"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description (Markdown supported)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Write a description about the book..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Book Content
              </label>
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'file' | 'url')} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="url">Provide URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="mt-0">
                  {bookFile ? (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-accent">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 truncate">{bookFile.name}</span>
                      <button 
                        type="button"
                        onClick={removeBookFile}
                        className="p-1 rounded-full hover:bg-accent-foreground/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full p-4 border border-dashed border-input rounded-md cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload book file</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          PDF, EPUB, or other document formats
                        </span>
                      </div>
                      <input 
                        type="file" 
                        accept=".pdf,.epub,.mobi,.txt" 
                        onChange={handleBookFileChange}
                        className="hidden" 
                      />
                    </label>
                  )}
                </TabsContent>
                
                <TabsContent value="url" className="mt-0">
                  <div className="flex items-center gap-2 border border-input rounded-md focus-within:ring-2 focus-within:ring-primary/20 pr-2">
                    <input
                      type="url"
                      value={bookUrl}
                      onChange={(e) => setBookUrl(e.target.value)}
                      placeholder="https://example.com/book.pdf"
                      className="flex-1 px-4 py-2 border-0 focus:outline-none bg-transparent"
                    />
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border">
          <motion.button
            type="submit"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Adding Book...</span>
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                <span>Save Book</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddBookForm;
