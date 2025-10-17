/**
 * Updates the favicon with a notification badge
 */
export function updateFaviconWithBadge(count: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    // Draw the original favicon
    ctx.drawImage(img, 0, 0, 32, 32);

    if (count > 0) {
      // Draw badge background (red circle)
      const badgeSize = count > 9 ? 20 : 16;
      const badgeX = 32 - badgeSize / 2 - 2;
      const badgeY = badgeSize / 2 + 2;

      ctx.fillStyle = '#ef4444'; // red-500
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeSize / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw white border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw count text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayCount = count > 99 ? '99+' : count.toString();
      ctx.fillText(displayCount, badgeX, badgeY);
    }

    // Update favicon
    const faviconUrl = canvas.toDataURL('image/png');
    updateFaviconHref(faviconUrl);
  };

  // Load the original favicon
  img.src = '/favicon-32x32.png';
}

/**
 * Updates the favicon href in the document
 */
function updateFaviconHref(href: string) {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]');

  links.forEach((link) => {
    link.href = href;
  });
}

/**
 * Resets the favicon to the original
 */
export function resetFavicon() {
  updateFaviconHref('/favicon-32x32.png');
}
