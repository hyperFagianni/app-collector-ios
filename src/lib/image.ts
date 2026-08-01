/** Renders a remote image in grayscale via the free images.weserv.nl proxy — no native deps needed. */
export function toGrayscaleUrl(url: string): string {
  if (!url) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&filt=greyscale`;
}
