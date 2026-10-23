import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const hotelsDir = 'src/content/hotels';
const citiesDir = 'src/content/cities';
const allowedBookings = new Set([
  'https://www.booking.com/hotel/fr/hotel-opera-liege.html',
  'https://www.booking.com/hotel/fr/hotel-henriette.html',
  'https://www.booking.com/hotel/fr/jeanne-d-39-arc-paris.html',
  'https://www.booking.com/hotel/fr/ha-tel-fabric.html',
  'https://www.booking.com/hotel/it/dina-suite-rome.html',
  'https://www.booking.com/hotel/it/artemide.html',
  'https://www.booking.com/hotel/it/g-rough.html',
  'https://www.booking.com/hotel/it/locarno.html',
  'https://www.booking.com/hotel/es/concordia.html',
  'https://www.booking.com/hotel/es/praktik-rambla.html',
  'https://www.booking.com/hotel/es/casa-bonay.html',
  'https://www.booking.com/hotel/es/brummell.html',
]);

const requiredFeatured = new Set(['hotel-opera-liege', 'dina-suite-rome', 'hotel-concordia']);
const note = 'Checked Nov 10–11, 2026 · prices change';

const cityFiles = (await readdir(citiesDir)).filter((file) => file.endsWith('.json'));
const cityIds = new Set(cityFiles.map((file) => file.replace(/\.json$/, '')));
const hotels = [];

for (const file of (await readdir(hotelsDir)).filter((name) => name.endsWith('.json'))) {
  const hotel = JSON.parse(await readFile(join(hotelsDir, file), 'utf8'));
  const id = file.replace(/\.json$/, '');
  hotels.push({ id, hotel });

  if (!cityIds.has(hotel.city)) throw new Error(`${id} points at unknown city ${hotel.city}`);
  if (!allowedBookings.has(hotel.bookingUrl)) throw new Error(`${id} has an unexpected Booking.com URL`);

  const price = hotel.price;
  if (price.status !== 'verified') throw new Error(`${id} is not a verified price`);
  for (const key of ['amount', 'occupancy', 'stayDate', 'checkedOn', 'room']) {
    if (price[key] == null || price[key] === '') throw new Error(`${id} verified price is missing ${key}`);
  }
  if (!Number.isInteger(price.amount)) throw new Error(`${id} price must be a whole dollar amount`);
  if (price.occupancy !== '2 adults') throw new Error(`${id} occupancy is not 2 adults`);
  if (price.stayDate !== '2026-11-10 to 2026-11-11') throw new Error(`${id} stay date is wrong`);
  if (price.checkedOn !== '2026-10-23') throw new Error(`${id} checkedOn is wrong`);
  if (price.note !== note) throw new Error(`${id} price note does not match the public line`);

  const review = hotel.review;
  if (!review || review.source !== 'Booking.com' || review.scale !== 10) {
    throw new Error(`${id} is missing a Booking.com review`);
  }
  if (review.checkedOn !== '2026-10-23') throw new Error(`${id} review was not checked on 2026-10-23`);
  if (!Number.isInteger(review.count) || review.count < 1) throw new Error(`${id} review count is invalid`);
  if (typeof review.score !== 'number' || review.score < 1 || review.score > 10) {
    throw new Error(`${id} review score is invalid`);
  }
}

if (hotels.length !== 12) throw new Error(`Expected 12 hotels, found ${hotels.length}`);
for (const city of cityIds) {
  const count = hotels.filter((entry) => entry.hotel.city === city).length;
  if (count !== 4) throw new Error(`${city} should have 4 hotels, found ${count}`);
}

for (const id of requiredFeatured) {
  const entry = hotels.find((item) => item.id === id);
  if (!entry?.hotel.featured) throw new Error(`${id} must be featured on the home page`);
}

const featured = hotels.filter((entry) => entry.hotel.featured);
if (featured.length !== 3) throw new Error(`Home page should feature 3 hotels, found ${featured.length}`);
console.log(`Content ok: ${hotels.length} hotels, ${cityIds.size} cities, all rates verified.`);
