
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Plus, BookIcon } from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "glassmorphism py-3" : "bg-transparent py-5"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-medium">Bookshelf</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <NavLink to="/" currentPath={location.pathname}>
              Home
            </NavLink>
            <NavLink to="/add" currentPath={location.pathname}>
              Add Book
            </NavLink>
          </nav>
        </div>
      </motion.header>

      <main className="pt-24 pb-12 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Bookshelf Library &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  currentPath: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, currentPath, children }) => {
  const isActive = currentPath === to;

  return (
    <Link 
      to={to} 
      className={`relative py-1 px-1 transition-colors duration-200 
        ${isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}`}
    >
      {children}
      {isActive && (
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"
          layoutId="navbar-indicator"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

export default Layout;
