import { Link2, Mail, Share2 } from "lucide-react";

type BlogArticleShareProps = {
  title: string;
  url: string;
};

export default function BlogArticleShare({ title, url }: BlogArticleShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Partager",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Share2,
    },
    {
      label: "E-mail",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: Mail,
    },
  ] as const;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <nav className="fj-blog-article__share" aria-label="Partager l'article">
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target={label === "E-mail" ? undefined : "_blank"}
          rel={label === "E-mail" ? undefined : "noopener noreferrer"}
          aria-label={`Partager via ${label}`}
        >
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        </a>
      ))}
      <button type="button" aria-label="Copier le lien" onClick={() => void copyLink()}>
        <Link2 size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </nav>
  );
}
