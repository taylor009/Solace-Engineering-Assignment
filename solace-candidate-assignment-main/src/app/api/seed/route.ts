import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function POST() {
  // Database seeding functionality - uncomment when database is configured
  // const records = await db.insert(advocates).values(advocateData).returning();
  
  // For now, return the static data
  return Response.json({ advocates: advocateData });
}
