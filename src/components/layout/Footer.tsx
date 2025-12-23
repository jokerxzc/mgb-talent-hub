import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <div>
                <p className="font-semibold text-sidebar-foreground">
                  Mines and Geosciences Bureau
                </p>
                <p className="text-xs text-sidebar-foreground/70">DENR</p>
              </div>
            </div>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
              The Mines and Geosciences Bureau is a government agency under the 
              Department of Environment and Natural Resources (DENR) responsible 
              for the conservation, management, and development of mineral resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                to="/vacancies"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                Job Vacancies
              </Link>
              <a
                href="https://mgb.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                Official MGB Website
              </a>
              <a
                href="https://denr.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                DENR Website
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-sidebar-foreground/70" />
                <p className="text-sm text-sidebar-foreground/70">
                  North Avenue, Diliman, Quezon City, Philippines
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-sidebar-foreground/70" />
                <p className="text-sm text-sidebar-foreground/70">(02) 8928-8544</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-sidebar-foreground/70" />
                <p className="text-sm text-sidebar-foreground/70">mgb@mgb.gov.ph</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-sidebar-foreground/60">
              © {new Date().getFullYear()} Mines and Geosciences Bureau. All rights reserved.
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              Republic of the Philippines
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
