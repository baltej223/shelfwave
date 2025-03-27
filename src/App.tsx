
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import BookDetail from "./pages/BookDetail";
import AddBook from "./pages/AddBook";
import NotFound from "./pages/NotFound";
import BookReaderPage from "./pages/BookReaderPage";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/book/:id" element={
                  <ProtectedRoute>
                    <BookDetail />
                  </ProtectedRoute>
                } />
                <Route path="/read/:id" element={
                  <ProtectedRoute>
                    <BookReaderPage />
                  </ProtectedRoute>
                } />
                <Route path="/add" element={
                  <ProtectedRoute>
                    <AddBook />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
