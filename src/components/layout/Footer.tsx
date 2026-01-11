import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About BaseMod", href: "/about" },
    { label: "The Development", href: "/development" },
    { label: "Contact Us", href: "/contact" },
  ],
  homes: [
    { label: "Home Models", href: "/models" },
    { label: "Design Studio", href: "/design-studio" },
    { label: "Pricing", href: "/pricing" },
  ],
};

export function Footer() {
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
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Modern CrossMod® homes with site-built components. 
              Thoughtfully designed for Grand Haven, Michigan.
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

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm">
                  Grand Haven, Michigan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent flex-shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent flex-shrink-0" />
                <a
                  href="mailto:info@basemod.dev"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  info@basemod.dev
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
            <p className="text-primary-foreground/50 text-xs">
              CrossMod® is a registered trademark. Homes built in partnership with Clayton Middlebury.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
