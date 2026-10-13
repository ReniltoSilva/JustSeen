import { useEffect } from "react";
import { siteUrl } from "./site";

export const defaultTitle = "JustSeen: share movie reviews with your friends";
export const defaultDescription =
  "Share quick movie reviews with your friends and see what they're watching. Rate films, keep a watchlist and pick your next movie from people whose taste you trust. Free.";

const setMeta = (name, content) => {
  document.querySelector(`meta[name="${name}"]`)?.setAttribute("content", content);
};

/* The tab title, and for public pages the description and canonical address Google uses.
Every page calls this, so moving between pages always replaces the previous page's values */
export const usePageMeta = ({ title, description, canonicalPath } = {}) => {
  useEffect(() => {
    document.title = title ? `${title} · JustSeen` : defaultTitle;
    setMeta("description", description || defaultDescription);

    /* The one official address for this page; logged-in pages have none */
    let link = document.querySelector('link[rel="canonical"]');
    if (canonicalPath) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = `${siteUrl}${canonicalPath}`;
    } else {
      link?.remove();
    }
  }, [title, description, canonicalPath]);
};
