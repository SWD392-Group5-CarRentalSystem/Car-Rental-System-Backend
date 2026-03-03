/**
 * Seed script — import vehicle data into MongoDB
 *
 * Usage:
 *   npx ts-node src/scripts/seedVehicles.ts
 *
 * Options (env vars):
 *   CLEAR=true   → Delete all existing vehicles before seeding (default: false)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { Vehicle } from "../modules/vehicle/models/vehicle.model";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";
const CLEAR_BEFORE_SEED = process.env.CLEAR === "true";

async function seed() {
  if (!MONGODB_URI) {
    console.error("❌  MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  // ── Connect ──────────────────────────────────────────────────────────────
  await mongoose.connect(MONGODB_URI);
  console.log("✅  MongoDB connected:", mongoose.connection.host);

  // ── Optionally clear existing data ───────────────────────────────────────
  if (CLEAR_BEFORE_SEED) {
    const deleted = await Vehicle.deleteMany({});
    console.log(`🗑️   Cleared ${deleted.deletedCount} existing vehicles`);
  }

  // ── Load seed data ────────────────────────────────────────────────────────
  const seedFile = path.join(__dirname, "../data/vehicles.seed.json");
  const raw = fs.readFileSync(seedFile, "utf-8");
  const vehicles = JSON.parse(raw);

  // ── Insert ────────────────────────────────────────────────────────────────
  const result = await Vehicle.insertMany(vehicles);
  console.log(`🚗  Seeded ${result.length} vehicles successfully`);

  // ── Done ──────────────────────────────────────────────────────────────────
  await mongoose.disconnect();
  console.log("🔌  Disconnected from MongoDB");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
