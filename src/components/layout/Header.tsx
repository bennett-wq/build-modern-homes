import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getQuoteRequests } from "@/types/quote-request";

const navItems = [
  { label: "Homes", href: "/models" },
  { label: "Communities", href: "/communities" },
  { label: "How It Works", href: "/how-it-works" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSavedQuote, setHasSavedQuote] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for saved quotes in localStorage
  useEffect(() => {
    const quotes = getQuoteRequests();
    setHasSavedQuote(quotes.length > 0);
  }, [location.pathname]);

  const handleGetQuote = () => {
    setIsOpen(false);
    navigate("/build");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">
              Base<span className="text-accent">Mod</span>Homes
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  location.pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Saved Quote link - only show when quote exists */}
            {hasSavedQuote && (
              <Link
                to="/quote/saved"
                className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4" />
                View Quote
              </Link>
            )}
          </nav>

          {/* Primary CTA - Get a Quote */}
          <div className="hidden lg:block">
            <Button onClick={handleGetQuote} size="lg">
              Get a Quote
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background border-b border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "py-3 px-4 text-base font-medium transition-colors rounded-md",
                    location.pathname === item.href
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Saved Quote link for mobile */}
              {hasSavedQuote && (
                <Link
                  to="/quote/saved"
                  onClick={() => setIsOpen(false)}
                  className="py-3 px-4 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Saved Quote
                </Link>
              )}
              
              <div className="pt-2 mt-2 border-t border-border">
                <Button onClick={handleGetQuote} className="w-full" size="lg">
                  Get a Quote
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
