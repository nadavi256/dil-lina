import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const hotelsDir = 'src/content/hotels';
const citiesDir = 'src/content/cities';
const allowedBookings = new Set([
  'https://www.booking.com/hotel/fr/hotel-opera-liege.html',
  'https://www.booking.com/hotel/fr/new-parnasse.html',
  'https://www.booking.com/hotel/fr/elysa-luxembourg.html',
  'https://www.booking.com/hotel/fr/whistler.html',
  'https://www.booking.com/hotel/fr/ha-tel-plaza-athe-ne-e-na-c-esparis.html',
  'https://www.booking.com/hotel/it/dina-suite-rome.html',
  'https://www.booking.com/hotel/it/casa-i-cappuccini.html',
  'https://www.booking.com/hotel/it/eccelso.html',
  'https://www.booking.com/hotel/it/magica-luna-boutique-roma.html',
  'https://www.booking.com/hotel/it/locarno.html',
  'https://www.booking.com/hotel/es/concordia.html',
  'https://www.booking.com/hotel/es/chi.html',
  'https://www.booking.com/hotel/es/sonder-los-arcos.html',
  'https://www.booking.com/hotel/es/el2bcn.html',
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
  if (hotel.tier !== 'edit' && hotel.tier !== 'true-luxury') throw new Error(`${id} has a bad tier`);

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
  if (hotel.tier === 'edit' && price.amount > 150) throw new Error(`${id} edit price is over $150`);
  if (hotel.tier === 'true-luxury' && price.amount <= 150) {
    throw new Error(`${id} is labeled a splurge but the checked rate is $150 or under`);
  }

  const review = hotel.review;
  if (!review || review.source !== 'Booking.com' || review.scale !== 10) {
    throw new Error(`${id} is missing a Booking.com review`);
  }
  if (review.checkedOn !== '2026-10-23') throw new Error(`${id} review was not checked on 2026-10-23`);
  if (!Number.isInteger(review.count) || review.count < 1) throw new Error(`${id} review count is invalid`);
  if (typeof review.score !== 'number' || review.score < 8.5 || review.score > 10) {
    throw new Error(`${id} review score is under 8.5`);
  }
}

for (const city of cityIds) {
  const inCity = hotels.filter((entry) => entry.hotel.city === city);
  const edit = inCity.filter((entry) => entry.hotel.tier === 'edit');
  const splurge = inCity.filter((entry) => entry.hotel.tier === 'true-luxury');
  if (edit.length < 3 || edit.length > 4) throw new Error(`${city} should have 3–4 edit hotels, found ${edit.length}`);
  if (splurge.length !== 1) throw new Error(`${city} should have exactly 1 splurge, found ${splurge.length}`);
}

for (const id of requiredFeatured) {
  const entry = hotels.find((item) => item.id === id);
  if (!entry?.hotel.featured || entry.hotel.tier !== 'edit') throw new Error(`${id} must be a featured edit hotel`);
}
const featured = hotels.filter((entry) => entry.hotel.featured);
if (featured.length !== requiredFeatured.size) {
  throw new Error(`Home leads should be ${requiredFeatured.size} hotels, found ${featured.length}`);
}

console.log(`Content ok: ${hotels.length} hotels, ${cityIds.size} cities, edit at $150 or under, one splurge each.`);
