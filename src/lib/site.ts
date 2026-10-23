export const site = {
  name: 'Lina',
  tagline: "Hotels that look like luxury, at a price you won't believe.",
  description:
    'Lina is an editor’s list of striking hotels for an international traveler. The hunt is the $80–150 night, plus an occasional true-luxury pick. A rate is printed only after it has been checked.',
  email: 'nadavi256@gmail.com',
  operator: 'Nadav Stern',
  aid: 'dillina',
  locale: 'en_US',
  origin: 'https://nadavi256.github.io',
} as const;

export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL;
  if (!path || path === '/') return base;
  const clean = path.replace(/^\/+/, '');
  if (/\.[a-z0-9]+$/i.test(clean)) return `${base}${clean}`;
  return `${base}${clean.replace(/\/+$/, '')}/`;
}

export function absolute(path = '/'): string {
  return new URL(url(path), site.origin).href;
}
