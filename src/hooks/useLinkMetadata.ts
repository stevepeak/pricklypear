import { useState, useEffect } from 'react';

interface LinkMetadata {
  title: string;
  description?: string;
  favicon?: string;
  domain: string;
  url: string;
}

interface UseLinkMetadataResult {
  metadata: LinkMetadata | null;
  loading: boolean;
  error: string | null;
}

export function useLinkMetadata(url: string): UseLinkMetadataResult {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract domain from URL
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        // Try to get favicon from common locations
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

        // For now, we'll use a simple approach with the domain and URL
        // In a production app, you might want to use a service like LinkPreview API
        // or implement server-side metadata fetching
        const linkMetadata: LinkMetadata = {
          title: domain,
          domain,
          url,
          favicon: faviconUrl,
        };

        setMetadata(linkMetadata);
      } catch (err) {
        setError('Failed to fetch link metadata');
        console.error('Error fetching link metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  return { metadata, loading, error };
}
