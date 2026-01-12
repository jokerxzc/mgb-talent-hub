import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import useTranslation

export function Footer() {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/mgb-logo.png" alt="MGB Logo" className="h-10 w-10 object-contain" />
              <div>
                <p className="font-semibold text-sidebar-foreground">
                  {t("mgb_region_2")}
                </p>
                <p className="text-xs text-sidebar-foreground/70">DENR</p>
              </div>
            </div>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
              {t("about_mgb_region_2")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t("quick_links")}</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                {t("home")}
              </Link>
              <Link
                to="/vacancies"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                {t("job_vacancies")}
              </Link>
              <a
                href="https://region2.mgb.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                {t("official_mgb_region_2_website")}
              </a>
              <a
                href="https://denr.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                {t("denr_website")}
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t("contact_us")}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-sidebar-foreground/70" />
                <p className="text-sm text-sidebar-foreground/70">
                  {t("address")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-sidebar-foreground/70" />
                <p className="text-sm text-sidebar-foreground/70">{t("phone_numbers")}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-sidebar-foreground/70" />
                <p className="text-sm text-sidebar-foreground/70">{t("email_addresses")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-sidebar-foreground/60">
              © {new Date().getFullYear()} {t("mgb_region_2")}. {t("all_rights_reserved")}
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              {t("republic_of_the_philippines")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}