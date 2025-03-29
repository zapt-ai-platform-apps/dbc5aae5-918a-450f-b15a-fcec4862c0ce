CREATE TABLE IF NOT EXISTS "vehicles" (
  "id" SERIAL PRIMARY KEY,
  "url" TEXT NOT NULL,
  "currentPrice" DECIMAL NOT NULL,
  "initialPrice" DECIMAL NOT NULL,
  "lastChecked" TIMESTAMP DEFAULT NOW(),
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "price_history" (
  "id" SERIAL PRIMARY KEY,
  "vehicle_id" INTEGER NOT NULL REFERENCES "vehicles"("id"),
  "price" DECIMAL NOT NULL,
  "timestamp" TIMESTAMP DEFAULT NOW()
);