import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { fetchCarData } from "./_apiUtils.js";
import Sentry from './_sentry.js';

// Define schema inline since we can't import from drizzle folder
const pgTable = (name, columns) => ({ name, columns });
const serial = name => ({ name, type: 'serial', primaryKey: true });
const text = name => ({ name, type: 'text', notNull: true });
const decimal = name => ({ name, type: 'decimal', notNull: true });
const timestamp = name => ({ name, type: 'timestamp', defaultNow: true, notNull: true });
const integer = name => ({ name, type: 'integer', notNull: true });

const vehicles = pgTable('vehicles', {
  id: serial('id'),
  url: text('url'),
  currentPrice: decimal('currentPrice'),
  initialPrice: decimal('initialPrice'),
  lastChecked: timestamp('lastChecked'),
  createdAt: timestamp('created_at')
});

const priceHistory = pgTable('price_history', {
  id: serial('id'),
  vehicleId: integer('vehicle_id'),
  price: decimal('price'),
  timestamp: timestamp('timestamp')
});

export default async function handler(req, res) {
  console.log("API: Checking price for vehicle");
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Processing price check for: ${url}`);

    // Connect to the database
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // Ensure tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        "currentPrice" DECIMAL NOT NULL,
        "initialPrice" DECIMAL NOT NULL,
        "lastChecked" TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        price DECIMAL NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    // Check if we're already tracking this vehicle
    const existingVehicles = await db.query.select()
      .from(vehicles)
      .where(eq(vehicles.url, url));

    let vehicle = existingVehicles[0];
    let priceDecreased = false;
    let previousPrice = null;

    // Fetch the current price from the website
    const { price: currentPrice } = await fetchCarData(url);

    // If we're already tracking this vehicle
    if (vehicle) {
      console.log(`Found existing vehicle with id: ${vehicle.id}`);
      previousPrice = vehicle.currentPrice;
      
      // Price has decreased
      if (currentPrice < previousPrice) {
        priceDecreased = true;
        console.log(`Price decreased from £${previousPrice} to £${currentPrice}`);
        
        // Update the vehicle record
        await db.update(vehicles)
          .set({ 
            currentPrice: currentPrice,
            lastChecked: new Date()
          })
          .where(eq(vehicles.id, vehicle.id));
        
        // Add to price history
        await db.insert(priceHistory)
          .values({
            vehicleId: vehicle.id,
            price: currentPrice,
          });
      } else {
        console.log(`Price unchanged or increased: £${currentPrice}`);
        // Just update the last checked timestamp
        await db.update(vehicles)
          .set({ lastChecked: new Date() })
          .where(eq(vehicles.id, vehicle.id));
      }
    } else {
      // This is a new vehicle we're tracking
      console.log(`Adding new vehicle tracking for: ${url}`);
      const [newVehicle] = await db.insert(vehicles)
        .values({
          url: url,
          currentPrice: currentPrice,
          initialPrice: currentPrice,
          lastChecked: new Date(),
        })
        .returning();
      
      vehicle = newVehicle;
      
      // Add the initial price to history
      await db.insert(priceHistory)
        .values({
          vehicleId: vehicle.id,
          price: currentPrice,
        });
    }

    // Get price history for this vehicle
    const history = await db.select()
      .from(priceHistory)
      .where(eq(priceHistory.vehicleId, vehicle.id));

    await client.end();

    return res.status(200).json({
      vehicle,
      priceDecreased,
      previousPrice,
      currentPrice,
      history
    });
  } catch (error) {
    console.error('Error in checkPrice API:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'An error occurred while checking the price' });
  }
}