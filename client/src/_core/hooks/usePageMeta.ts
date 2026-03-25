import { useEffect } from "react";

type PageMetaOptions = {
  title?: string;
  description?: string;
};

function upsertMeta(name: string, content: string) {
  let node = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute("name", name);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

export function usePageMeta({ title, description }: PageMetaOptions) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      upsertMeta("description", description);
    }
  }, [title, description]);
}
