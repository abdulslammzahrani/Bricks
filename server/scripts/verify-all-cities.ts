import "dotenv/config";
import { db } from "../db";
import { cities } from "@shared/schema";
import { saudiCities } from "@shared/saudi-locations";

async function verifyCities() {
  console.log("🔍 التحقق من المدن...\n");
  
  const dbCities = await db.select().from(cities);
  const fileCities = saudiCities;
  
  console.log(`📊 الإحصائيات:`);
  console.log(`   الملف: ${fileCities.length} مدينة`);
  console.log(`   قاعدة البيانات: ${dbCities.length} مدينة\n`);
  
  if (dbCities.length === fileCities.length) {
    console.log("✅ جميع المدن موجودة في قاعدة البيانات!");
  } else {
    console.log("⚠️  هناك اختلاف في العدد");
    
    const dbCityNames = new Set(dbCities.map(c => c.name));
    const fileCityNames = new Set(fileCities.map(c => c.name));
    
    const missingInDb = fileCities.filter(c => !dbCityNames.has(c.name));
    const extraInDb = dbCities.filter(c => !fileCityNames.has(c.name));
    
    if (missingInDb.length > 0) {
      console.log(`\n❌ المدن الناقصة في قاعدة البيانات (${missingInDb.length}):`);
      missingInDb.forEach(c => console.log(`   - ${c.name}`));
    }
    
    if (extraInDb.length > 0) {
      console.log(`\n➕ المدن الإضافية في قاعدة البيانات (${extraInDb.length}):`);
      extraInDb.forEach(c => console.log(`   - ${c.name}`));
    }
  }
  
  console.log("\n📋 قائمة جميع المدن في قاعدة البيانات:");
  dbCities.forEach((city, index) => {
    console.log(`${index + 1}. ${city.name} (${city.region})`);
  });
  
  process.exit(0);
}

verifyCities().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

