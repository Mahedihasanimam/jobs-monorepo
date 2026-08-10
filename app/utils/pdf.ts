export function getEmbeddedDocumentUrl(url: string) {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
}
