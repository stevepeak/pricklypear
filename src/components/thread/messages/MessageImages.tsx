import { supabase } from '@/integrations/supabase/client';
import React, { useState } from 'react';

interface MessageImagesProps {
  assets?: string[];
  onImagesLoaded?: () => void;
}

export function MessageImages({ assets, onImagesLoaded }: MessageImagesProps) {
  const imageUrls = React.useMemo(() => {
    if (!assets?.length) return [];
    return assets.map((filePath) => {
      const {
        data: { publicUrl },
      } = supabase.storage.from('threads').getPublicUrl(filePath);
      return publicUrl;
    });
  }, [assets]);
  const [loadedImages, setLoadedImages] = useState(0);

  const handleImageLoad = () => {
    const newLoadedCount = loadedImages + 1;
    setLoadedImages(newLoadedCount);
    if (newLoadedCount === imageUrls.length) {
      onImagesLoaded?.();
    }
  };

  if (!imageUrls.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {imageUrls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Attachment ${index + 1}`}
          className="max-w-[200px] rounded-lg"
          loading="lazy"
          onLoad={handleImageLoad}
        />
      ))}
    </div>
  );
}
