import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { brandMessaging } from "@/content/brandMessaging";

const footerLinks = {
  company: [
    { label: "About BaseMod", href: "/about" },
    { label: "Our Mission", href: "/mission" },
    { label: "Contact Us", href: "/contact" },
  ],
  homes: [
    { label: "Home Models", href: "/models" },
    { label: "Communities", href: "/communities" },
    { label: "Pricing", href: "/pricing" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-semibold tracking-tight">
                Base<span className="text-accent">Mod</span>
              </span>
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed mb-4">
              {brandMessaging.tagline}
            </p>
            <p className="text-primary-foreground/50 text-xs leading-relaxed">
              Modern modular homes. Thoughtfully designed for people who want quality, speed, and attainability.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-primary-foreground/80">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Homes Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-primary-foreground/80">
              Homes
            </h4>
            <ul className="space-y-3">
              {footerLinks.homes.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-primary-foreground/80">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/60 text-sm">
                  Ann Arbor • Chicago
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent flex-shrink-0" />
                <a
                  href="tel:7346467867"
                  className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
                >
                  (734) 646-7867
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent flex-shrink-0" />
                <a
                  href="mailto:info@basemodhomes.com"
                  className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
                >
                  info@basemodhomes.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/40 text-sm">
              © {new Date().getFullYear()} BaseMod Developments. All rights reserved.
            </p>
            <Link 
              to="/privacy-policy" 
              className="text-primary-foreground/40 hover:text-primary-foreground/60 text-xs transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
