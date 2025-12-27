import {
  cities,
  districts,
  directions,
  type City,
  type InsertCity,
  type District,
  type InsertDistrict,
  type Direction,
  type InsertDirection,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc } from "drizzle-orm";
import { locationCache } from "./location-cache";

// ==================== CITIES ====================

export async function getAllCities(): Promise<City[]> {
  const cacheKey = "all-cities";
  const cached = locationCache.get<City[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await db
    .select()
    .from(cities)
    .orderBy(asc(cities.order), asc(cities.name));
  
  locationCache.set(cacheKey, result);
  return result;
}

export async function getCityById(id: string): Promise<City | undefined> {
  const result = await db.select().from(cities).where(eq(cities.id, id)).limit(1);
  return result[0];
}

export async function getCityByName(name: string): Promise<City | undefined> {
  const result = await db.select().from(cities).where(eq(cities.name, name)).limit(1);
  return result[0];
}

export async function createCity(city: InsertCity): Promise<City> {
  const result = await db.insert(cities).values(city).returning();
  locationCache.invalidate("cities");
  return result[0];
}

export async function updateCity(
  id: string,
  data: Partial<InsertCity>
): Promise<City | undefined> {
  const result = await db
    .update(cities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cities.id, id))
    .returning();
  locationCache.invalidate("cities");
  return result[0];
}

export async function deleteCity(id: string): Promise<void> {
  await db.delete(cities).where(eq(cities.id, id));
  locationCache.invalidate("cities");
}

export async function reorderCities(cityIds: string[]): Promise<void> {
  for (let i = 0; i < cityIds.length; i++) {
    await db
      .update(cities)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(cities.id, cityIds[i]));
  }
}

// ==================== DISTRICTS ====================

export async function getAllDistricts(cityId?: string): Promise<District[]> {
  const cacheKey = cityId ? `districts-${cityId}` : "all-districts";
  const cached = locationCache.get<District[]>(cacheKey);
  if (cached) {
    return cached;
  }

  let result: District[];
  if (cityId) {
    result = await db
      .select()
      .from(districts)
      .where(eq(districts.cityId, cityId))
      .orderBy(asc(districts.order), asc(districts.name));
  } else {
    result = await db
      .select()
      .from(districts)
      .orderBy(asc(districts.cityId), asc(districts.order), asc(districts.name));
  }
  
  locationCache.set(cacheKey, result);
  return result;
}

export async function getDistrictById(id: string): Promise<District | undefined> {
  const result = await db.select().from(districts).where(eq(districts.id, id)).limit(1);
  return result[0];
}

export async function getDistrictByName(cityId: string, name: string): Promise<District | undefined> {
  const result = await db
    .select()
    .from(districts)
    .where(and(eq(districts.cityId, cityId), eq(districts.name, name)))
    .limit(1);
  return result[0];
}

export async function createDistrict(district: InsertDistrict): Promise<District> {
  const result = await db.insert(districts).values(district).returning();
  locationCache.invalidate("districts");
  return result[0];
}

export async function updateDistrict(
  id: string,
  data: Partial<InsertDistrict>
): Promise<District | undefined> {
  const result = await db
    .update(districts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(districts.id, id))
    .returning();
  locationCache.invalidate("districts");
  return result[0];
}

export async function deleteDistrict(id: string): Promise<void> {
  await db.delete(districts).where(eq(districts.id, id));
  locationCache.invalidate("districts");
}

export async function reorderDistricts(districtIds: string[]): Promise<void> {
  for (let i = 0; i < districtIds.length; i++) {
    await db
      .update(districts)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(districts.id, districtIds[i]));
  }
}

// ==================== DIRECTIONS ====================

export async function getAllDirections(): Promise<Direction[]> {
  return await db
    .select()
    .from(directions)
    .orderBy(asc(directions.order), asc(directions.code));
}

export async function getDirectionById(id: string): Promise<Direction | undefined> {
  const result = await db.select().from(directions).where(eq(directions.id, id)).limit(1);
  return result[0];
}

export async function getDirectionByCode(code: string): Promise<Direction | undefined> {
  const result = await db.select().from(directions).where(eq(directions.code, code)).limit(1);
  return result[0];
}

export async function createDirection(direction: InsertDirection): Promise<Direction> {
  const result = await db.insert(directions).values(direction).returning();
  return result[0];
}

export async function updateDirection(
  id: string,
  data: Partial<InsertDirection>
): Promise<Direction | undefined> {
  const result = await db
    .update(directions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(directions.id, id))
    .returning();
  return result[0];
}

export async function deleteDirection(id: string): Promise<void> {
  await db.delete(directions).where(eq(directions.id, id));
}

