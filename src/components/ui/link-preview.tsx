import { useLinkMetadata } from '../../hooks/useLinkMetadata';
import { ExternalLink, Globe } from 'lucide-react';

interface LinkPreviewProps {
  href: string;
  children?: React.ReactNode;
}

export function LinkPreview({ href, children }: LinkPreviewProps) {
  const { metadata, loading, error } = useLinkMetadata(href);

  if (loading) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary hover:bg-primary/20 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>Loading...</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  if (error || !metadata) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary hover:bg-primary/20 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{children || href}</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm text-foreground hover:bg-muted/70 transition-colors max-w-xs"
    >
      {metadata.favicon && (
        <img
          src={metadata.favicon}
          alt=""
          className="w-4 h-4 rounded-sm flex-shrink-0"
          onError={(e) => {
            // Fallback to globe icon if favicon fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const globeIcon = parent.querySelector('.globe-fallback');
              if (globeIcon) {
                (globeIcon as HTMLElement).style.display = 'block';
              }
            }
          }}
        />
      )}
      <Globe className="w-4 h-4 globe-fallback hidden" />
      <span className="truncate flex-1 min-w-0">{metadata.title}</span>
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
    </a>
  );
}
