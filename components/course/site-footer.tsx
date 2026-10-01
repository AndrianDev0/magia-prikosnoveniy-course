import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <p className="footer-signature">Эмиль</p>
        </div>
        <div className="footer-contacts">
          <span className="footer-label">Контакты</span>
          <a href={`mailto:${siteConfig.contacts.email}`}>{siteConfig.contacts.email}</a>
          <a href={`tel:${siteConfig.contacts.phone.replace(/[^+\d]/g, "")}`}>{siteConfig.contacts.phone}</a>
          <span>{siteConfig.contacts.location}</span>
        </div>
        {siteConfig.socials.length ? <div className="footer-socials" aria-label="Социальные сети">{siteConfig.socials.map((social) => <a href={social.href} aria-label={social.label} key={social.label}>{social.label}</a>)}</div> : null}
      </div>
      <div className="footer-legal">
        <div>{siteConfig.legalDocuments.map((document) => <a href={document.href} key={document.href}>{document.label}</a>)}</div>
        <span>© {new Date().getFullYear()} {siteConfig.author.name}. Все права защищены.</span>
      </div>
    </footer>
  );
}
