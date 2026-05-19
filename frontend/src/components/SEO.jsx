import { useEffect } from 'react';

const SITE_NAME = 'Улаан Хад Ресорт';
const DEFAULT_DESC = 'Горхи-Тэрэлж Үндэсний Цэцэрлэгт Хүрээлэнгийн 5 оддын тансаг ресорт. Байгалийн цэвэр амралт, тансаг өрөө, гурмэ хоол.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';
const BASE_URL = 'https://travel-web-mu-one.vercel.app';

function setMeta(name, value, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setLdJson(data) {
  let script = document.getElementById('page-ld-json');
  if (!script) {
    script = document.createElement('script');
    script.id = 'page-ld-json';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function removeLdJson() {
  document.getElementById('page-ld-json')?.remove();
}

export default function SEO({ title, description, image, path, structuredData }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Горхи-Тэрэлж`;
  const desc = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMAGE;
  const url = path ? `${BASE_URL}${path}` : BASE_URL;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = fullTitle;

    setMeta('description', desc);
    setLink('canonical', url);

    setMeta('og:type', 'website', 'property');
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:image', img, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('og:locale', 'mn_MN', 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);

    if (structuredData) setLdJson(structuredData);
    else removeLdJson();

    return () => {
      document.title = prevTitle;
      removeLdJson();
    };
  }, [fullTitle, desc, img, url, structuredData]);

  return null;
}
