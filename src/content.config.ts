import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const price = z.object({
  status: z.enum(['TODO', 'verified']),
  amount: z.number().positive().nullable(),
  currency: z.literal('USD'),
  unit: z.literal('night'),
  occupancy: z.string().nullable(),
  stayDate: z.string().nullable(),
  checkedOn: z.string().nullable(),
  room: z.string().nullable(),
  note: z.string().min(20),
});

const review = z.object({
  score: z.number().min(1).max(10),
  count: z.number().int().positive(),
  source: z.literal('Booking.com'),
  scale: z.literal(10),
  checkedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const hotels = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/hotels' }),
  schema: z.object({
    name: z.string(),
    city: z.enum(['paris', 'rome', 'barcelona']),
    neighborhood: z.string(),
    mark: z.string().max(3),
    tone: z.enum(['wine', 'ink', 'clay', 'forest', 'olive', 'night', 'plum', 'brass', 'sea']),
    tier: z.enum(['edit', 'true-luxury']),
    featured: z.boolean(),
    featuredOrder: z.number().int(),
    cityOrder: z.number().int(),
    summary: z.string(),
    description: z.string(),
    facts: z.array(z.string()).min(2),
    officialCategory: z.number().int().min(1).max(5).nullable(),
    address: z.object({
      street: z.string(),
      postalCode: z.string(),
      locality: z.string(),
      country: z.string(),
      countryCode: z.string().length(2),
    }),
    bookingUrl: z.url(),
    price,
    review: review.nullable(),
  }),
});

const cities = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/cities' }),
  schema: z.object({
    name: z.string(),
    country: z.string(),
    countryCode: z.string().length(2),
    kicker: z.string(),
    headline: z.string(),
    summary: z.string(),
    intro: z.string(),
    photo: z.enum(['paris', 'paris-night', 'rome', 'barcelona', 'barcelona-sagrada']),
    order: z.number().int(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kicker: z.string(),
    published: z.string(),
    updated: z.string(),
    minutes: z.number().int(),
    photo: z.enum(['paris', 'paris-night', 'rome', 'barcelona', 'barcelona-sagrada']),
  }),
});

export const collections = { hotels, cities, guides };
