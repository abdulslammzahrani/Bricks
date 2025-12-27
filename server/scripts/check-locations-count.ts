import "dotenv/config";
import { db } from "../db";
import { cities, districts, directions } from "@shared/schema";

async function checkCounts() {
  const citiesCount = await db.select().from(cities);
  const districtsCount = await db.select().from(districts);
  const directionsCount = await db.select().from(directions);
  
  console.log("📊 إحصائيات البيانات المضافة:");
  console.log(`المدن: ${citiesCount.length}`);
  console.log(`الأحياء: ${districtsCount.length}`);
  console.log(`الاتجاهات: ${directionsCount.length}`);
  
  process.exit(0);
}

checkCounts().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

