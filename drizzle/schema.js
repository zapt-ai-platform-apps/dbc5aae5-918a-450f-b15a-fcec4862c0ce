import { pgTable, serial, text, timestamp, decimal, integer } from 'drizzle-orm/pg-core';

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  currentPrice: decimal('currentPrice').notNull(),
  initialPrice: decimal('initialPrice').notNull(),
  lastChecked: timestamp('lastChecked').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id),
  price: decimal('price').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});