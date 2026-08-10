import * as WebBrowser from 'expo-web-browser';

export function getValidUrl(value?: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export async function openExternalUrl(value?: string | null) {
  const url = getValidUrl(value);
  if (!url) return false;
  await WebBrowser.openBrowserAsync(url, {
    controlsColor: '#006A4E',
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
  });
  return true;
}
