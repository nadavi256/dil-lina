import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const hotelsDir = 'src/content/hotels';
const citiesDir = 'src/content/cities';
const allowedBookings = new Set([
  'https://www.booking.com/hotel/fr/hotel-henriette.html',
  'https://www.booking.com/hotel/fr/jeanne-d-39-arc-paris.html',
  'https://www.booking.com/hotel/fr/ha-tel-fabric.html',
  'https://www.booking.com/hotel/it/artemide.html',
  'https://www.booking.com/hotel/it/g-rough.html',
  'https://www.booking.com/hotel/it/locarno.html',
  'https://www.booking.com/hotel/es/praktik-rambla.html',
  'https://www.booking.com/hotel/es/casa-bonay.html',
  'https://www.booking.com/hotel/es/brummell.html',
]);

const cityFiles = (await readdir(citiesDir)).filter((file) => file.endsWith('.json'));
const cityIds = new Set(cityFiles.map((file) => file.replace(/\.json$/, '')));
const hotels = [];

for (const file of (await readdir(hotelsDir)).filter((name) => name.endsWith('.json'))) {
  const hotel = JSON.parse(await readFile(join(hotelsDir, file), 'utf8'));
  const id = file.replace(/\.json$/, '');
  hotels.push({ id, hotel });

  if (!cityIds.has(hotel.city)) throw new Error(`${id} points at unknown city ${hotel.city}`);
  if (!allowedBookings.has(hotel.bookingUrl)) throw new Error(`${id} has an unexpected Booking.com URL`);
  if (hotel.guestRating != null || hotel.rating != null) throw new Error(`${id} must not invent a rating`);

  const price = hotel.price;
  if (price.status === 'TODO') {
    for (const key of ['amount', 'occupancy', 'stayDate', 'checkedOn', 'room']) {
      if (price[key] != null) throw new Error(`${id} TODO price still has ${key}`);
    }
    if (!String(price.note).includes('TODO')) throw new Error(`${id} TODO note is not marked TODO`);
  } else if (price.status === 'verified') {
    for (const key of ['amount', 'occupancy', 'stayDate', 'checkedOn', 'room']) {
      if (price[key] == null || price[key] === '') throw new Error(`${id} verified price is missing ${key}`);
    }
  } else {
    throw new Error(`${id} has an unknown price status`);
  }
}

if (hotels.length !== 9) throw new Error(`Expected 9 hotels, found ${hotels.length}`);
for (const city of cityIds) {
  const count = hotels.filter((entry) => entry.hotel.city === city).length;
  if (count !== 3) throw new Error(`${city} should have 3 hotels, found ${count}`);
}

const featured = hotels.filter((entry) => entry.hotel.featured);
if (featured.length < 3) throw new Error('Home page needs at least 3 featured hotels');
console.log(`Content ok: ${hotels.length} hotels, ${cityIds.size} cities.`);
