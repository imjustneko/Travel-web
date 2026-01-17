// frontend/src/components/SEO.jsx
import { Helmet } from 'react-helmet-async';

function SEO({ title, description, image }) {
  return (
    <Helmet>
      <title>{title} | Red Rock Resort</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
    </Helmet>
  );
}