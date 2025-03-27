
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();

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
            {user ? (
              <>
                <NavLink to="/" currentPath={location.pathname}>
                  Home
                </NavLink>
                <NavLink to="/add" currentPath={location.pathname}>
                  Add Book
                </NavLink>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-muted-foreground">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
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
