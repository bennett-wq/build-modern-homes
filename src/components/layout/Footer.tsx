import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const footerLinks = {
  company: [
    { label: "Our Mission", href: "/mission" },
    { label: "About BaseMod", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  homes: [
    { label: "Home Models", href: "/models" },
    { label: "Communities", href: "/communities" },
    { label: "Pricing", href: "/pricing" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email service
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-semibold tracking-tight">
                Base<span className="text-accent">Mod</span>
              </span>
            </Link>
            <p className="text-xl font-medium text-primary-foreground mb-2">
              Rebuilding the path to ownership.
            </p>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Modern modular homes with transparent pricing. Making homeownership accessible again—at scale.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Homes Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Homes
            </h4>
            <ul className="space-y-3">
              {footerLinks.homes.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Stay Updated
            </h4>
            
            {/* Newsletter Form */}
            <div className="bg-primary-foreground/5 rounded-xl p-4 mb-6">
              <p className="text-primary-foreground/70 text-sm mb-3">
                New communities, new models, and the work of making ownership possible again.
              </p>
              {subscribed ? (
                <p className="text-accent text-sm font-medium">
                  ✓ Thanks for subscribing!
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="bg-accent text-accent-foreground hover:bg-accent/90 px-4"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm">
                  Ann Arbor • Chicago
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent flex-shrink-0" />
                <a
                  href="tel:7346467867"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  (734) 646-7867
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent flex-shrink-0" />
                <a
                  href="mailto:info@basemodhomes.com"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  info@basemodhomes.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © {new Date().getFullYear()} BaseMod Developments. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link 
                to="/privacy-policy" 
                className="text-primary-foreground/50 hover:text-primary-foreground/70 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
