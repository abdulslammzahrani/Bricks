import "dotenv/config";
import { db } from "../db";
import { cities, districts, directions } from "@shared/schema";
import { saudiCities, directionLabels } from "@shared/saudi-locations";
import { eq } from "drizzle-orm";

async function migrateLocations() {
  console.log("🚀 Starting locations migration...");

  try {
    // 1. Insert directions first
    console.log("📌 Inserting directions...");
    const directionCodes = Object.keys(directionLabels) as Array<keyof typeof directionLabels>;
    
    for (let i = 0; i < directionCodes.length; i++) {
      const code = directionCodes[i];
      const existing = await db.select().from(directions).where(eq(directions.code, code)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(directions).values({
          code,
          labelAr: directionLabels[code],
          labelEn: code.charAt(0).toUpperCase() + code.slice(1),
          isActive: true,
          order: i + 1,
        });
        console.log(`  ✓ Added direction: ${directionLabels[code]}`);
      } else {
        console.log(`  ⊙ Direction already exists: ${directionLabels[code]}`);
      }
    }

    // 2. Insert cities
    console.log("\n🏙️  Inserting cities...");
    for (let i = 0; i < saudiCities.length; i++) {
      const city = saudiCities[i];
      const existing = await db.select().from(cities).where(eq(cities.name, city.name)).limit(1);
      
      if (existing.length === 0) {
        const [inserted] = await db.insert(cities).values({
          name: city.name,
          nameEn: city.nameEn,
          region: city.region,
          latitude: city.coordinates.lat,
          longitude: city.coordinates.lng,
          isActive: true,
          order: i + 1,
        }).returning();
        
        console.log(`  ✓ Added city: ${city.name} (${inserted.id})`);

        // 3. Insert districts for this city
        console.log(`    📍 Inserting districts for ${city.name}...`);
        for (let j = 0; j < city.neighborhoods.length; j++) {
          const neighborhood = city.neighborhoods[j];
          
          // Calculate approximate coordinates for district
          // Use city coordinates with small offset based on direction
          let lat = city.coordinates.lat;
          let lng = city.coordinates.lng;
          
          if (neighborhood.direction) {
            const offset = 0.05; // ~5km offset
            switch (neighborhood.direction) {
              case "north":
                lat += offset;
                break;
              case "south":
                lat -= offset;
                break;
              case "east":
                lng += offset;
                break;
              case "west":
                lng -= offset;
                break;
              case "center":
                // Keep city center
                break;
            }
          } else {
            // Random small offset if no direction
            lat += (Math.random() - 0.5) * 0.1;
            lng += (Math.random() - 0.5) * 0.1;
          }

          const existingDistrict = await db
            .select()
            .from(districts)
            .where(eq(districts.cityId, inserted.id))
            .where(eq(districts.name, neighborhood.name))
            .limit(1);

          if (existingDistrict.length === 0) {
            await db.insert(districts).values({
              cityId: inserted.id,
              name: neighborhood.name,
              nameEn: neighborhood.nameEn,
              direction: neighborhood.direction || null,
              latitude: lat,
              longitude: lng,
              isActive: true,
              order: j + 1,
            });
            console.log(`      ✓ Added district: ${neighborhood.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          } else {
            console.log(`      ⊙ District already exists: ${neighborhood.name}`);
          }
        }
      } else {
        console.log(`  ⊙ City already exists: ${city.name}`);
      }
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateLocations()
    .then(() => {
      console.log("Migration script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateLocations };

