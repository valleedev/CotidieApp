// Con `web.output` en modo "single" (default de Expo Router, el que usa este
// proyecto), `+html.tsx` no se consulta — Expo genera un index.html fijo sin
// pasar por ese archivo. Por eso el manifest link + meta tags de iOS se
// inyectan en runtime en vez de en build time.
export function ensurePwaHeadTags(): void {
  if (document.querySelector('link[rel="manifest"]')) return;

  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = '/manifest.json';
  document.head.appendChild(manifestLink);

  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = '/icon.png';
  document.head.appendChild(appleTouchIcon);

  const metaTags: Array<[string, string]> = [
    ['apple-mobile-web-app-capable', 'yes'],
    ['apple-mobile-web-app-status-bar-style', 'default'],
    ['apple-mobile-web-app-title', 'Cotidie'],
  ];
  for (const [name, content] of metaTags) {
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  }
}
