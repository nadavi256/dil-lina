import type { ImageMetadata } from 'astro';
import paris from '../assets/photos/paris.jpg';
import parisNight from '../assets/photos/paris-night.jpg';
import rome from '../assets/photos/rome.jpg';
import barcelona from '../assets/photos/barcelona.jpg';
import barcelonaSagrada from '../assets/photos/barcelona-sagrada.jpg';

export type PhotoKey = 'paris' | 'paris-night' | 'rome' | 'barcelona' | 'barcelona-sagrada';

export const photos: Record<PhotoKey, ImageMetadata> = {
  paris,
  'paris-night': parisNight,
  rome,
  barcelona,
  'barcelona-sagrada': barcelonaSagrada,
};

export interface PhotoCredit {
  alt: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
}

export const credits: Record<PhotoKey, PhotoCredit> = {
  paris: {
    alt: 'The Eiffel Tower rising above a Paris street in daylight',
    photographer: 'Anthony DELANOIX',
    photographerUrl: 'https://unsplash.com/@anthonydelanoix',
    photoUrl: 'https://unsplash.com/photos/eiffel-tower-during-daytime-Q0-fOL2nqZc',
  },
  'paris-night': {
    alt: 'A bridge over the Seine in Paris at night',
    photographer: 'Léonard Cotte',
    photographerUrl: 'https://unsplash.com/@ettocl',
    photoUrl: 'https://unsplash.com/photos/bridge-during-night-time-R5scocnOOdM',
  },
  rome: {
    alt: 'The Colosseum in Rome at blue hour',
    photographer: 'David Köhler',
    photographerUrl: 'https://unsplash.com/@davidkhlr',
    photoUrl: 'https://unsplash.com/photos/colosseum-arena-photography-VFRTXGw1VjU',
  },
  barcelona: {
    alt: 'An aerial view of Barcelona’s streets and rooftops in daylight',
    photographer: 'Logan Armstrong',
    photographerUrl: 'https://unsplash.com/@loganstrongarms',
    photoUrl: 'https://unsplash.com/photos/hVhfqhDYciU',
  },
  'barcelona-sagrada': {
    alt: 'The towers of the Sagrada Família against a blue sky',
    photographer: 'Andreeew Hoang',
    photographerUrl: 'https://unsplash.com/@andeeew',
    photoUrl: 'https://unsplash.com/photos/sagrada-familia-c9ggQVcrtK8',
  },
};
