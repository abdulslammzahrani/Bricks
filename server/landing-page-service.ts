import { db } from "./db";
import { 
  landingPages, 
  marketerLinks, 
  progressiveProfiles, 
  properties, 
  users,
  buyerPreferences,
  appointments,
  propertyLeads
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import crypto from "crypto";

/**
 * Landing Page Service
 * إدارة صفحات الهبوط العقارية ونظام القمع التسويقي
 */

export interface LandingPageData {
  property: typeof properties.$inferSelect;
  landingPage: typeof landingPages.$inferSelect;
  seller?: typeof users.$inferSelect;
}

export interface ProgressiveProfileData {
  name: string;
  phone: string;
  email?: string;
  propertyId: string;
  landingPageId?: string;
  marketerRef?: string;
}

/**
 * Get landing page by slug
 */
export async function getLandingPageBySlug(slug: string): Promise<LandingPageData | null> {
  const [landingPage] = await db
    .select()
    .from(landingPages)
    .where(and(
      eq(landingPages.slug, slug),
      eq(landingPages.isActive, true)
    ))
    .limit(1);

  if (!landingPage) return null;

  // Get property
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, landingPage.propertyId))
    .limit(1);

  if (!property) return null;

  // Get seller
  let seller = null;
  if (property.sellerId) {
    const [sellerData] = await db
      .select()
      .from(users)
      .where(eq(users.id, property.sellerId))
      .limit(1);
    seller = sellerData || null;
  }

  // Increment views count
  await db
    .update(landingPages)
    .set({ 
      viewsCount: landingPage.viewsCount + 1,
      updatedAt: new Date()
    })
    .where(eq(landingPages.id, landingPage.id));

  return {
    property,
    landingPage,
    seller: seller || undefined,
  };
}

/**
 * Track landing page view (for marketer tracking)
 */
export async function trackLandingPageView(slug: string, marketerRef?: string) {
  const landingPageData = await getLandingPageBySlug(slug);
  if (!landingPageData) return;

  // Track marketer link click if ref provided
  if (marketerRef) {
    const [marketerLink] = await db
      .select()
      .from(marketerLinks)
      .where(and(
        eq(marketerLinks.trackingCode, marketerRef),
        eq(marketerLinks.landingPageId, landingPageData.landingPage.id),
        eq(marketerLinks.isActive, true)
      ))
      .limit(1);

    if (marketerLink) {
      await db
        .update(marketerLinks)
        .set({
          clicks: marketerLink.clicks + 1,
          updatedAt: new Date()
        })
        .where(eq(marketerLinks.id, marketerLink.id));
    }
  }
}

/**
 * Create or get progressive profile (Stage 1: Basic info)
 */
export async function createProgressiveProfile(data: ProgressiveProfileData): Promise<{
  profile: typeof progressiveProfiles.$inferSelect;
  unlockToken: string;
}> {
  // Normalize phone
  let normalizedPhone = data.phone.replace(/[^\d]/g, '');
  if (normalizedPhone.startsWith('966')) {
    normalizedPhone = '0' + normalizedPhone.slice(3);
  }

  // Check if profile already exists
  const [existing] = await db
    .select()
    .from(progressiveProfiles)
    .where(eq(progressiveProfiles.visitorPhone, normalizedPhone))
    .limit(1);

  const unlockToken = crypto.randomBytes(32).toString('hex');

  if (existing) {
    // Update existing profile
    const [updated] = await db
      .update(progressiveProfiles)
      .set({
        basicData: {
          name: data.name,
          phone: normalizedPhone,
          email: data.email || null,
        },
        propertyInterestedId: data.propertyId,
        landingPageId: data.landingPageId || null,
        unlockToken,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(progressiveProfiles.id, existing.id))
      .returning();

    // Track marketer conversion
    if (data.marketerRef && updated.marketerLinkId) {
      const [marketerLink] = await db
        .select()
        .from(marketerLinks)
        .where(eq(marketerLinks.id, updated.marketerLinkId))
        .limit(1);

      if (marketerLink) {
        await db
          .update(marketerLinks)
          .set({
            conversions: marketerLink.conversions + 1,
            updatedAt: new Date()
          })
          .where(eq(marketerLinks.id, marketerLink.id));
      }
    }

    // Update landing page leads count
    if (updated.landingPageId) {
      const [landingPage] = await db
        .select()
        .from(landingPages)
        .where(eq(landingPages.id, updated.landingPageId))
        .limit(1);

      if (landingPage) {
        await db
          .update(landingPages)
          .set({
            leadsCount: landingPage.leadsCount + 1,
            updatedAt: new Date()
          })
          .where(eq(landingPages.id, landingPage.id));
      }
    }

    return { profile: updated, unlockToken };
  }

  // Find marketer link if ref provided
  let marketerLinkId = null;
  if (data.marketerRef && data.landingPageId) {
    const [marketerLink] = await db
      .select()
      .from(marketerLinks)
      .where(and(
        eq(marketerLinks.trackingCode, data.marketerRef),
        eq(marketerLinks.landingPageId, data.landingPageId),
        eq(marketerLinks.isActive, true)
      ))
      .limit(1);
    marketerLinkId = marketerLink?.id || null;
  }

  // Create new profile
  const [newProfile] = await db
    .insert(progressiveProfiles)
    .values({
      visitorPhone: normalizedPhone,
      propertyInterestedId: data.propertyId,
      landingPageId: data.landingPageId || null,
      marketerLinkId,
      stage: 1,
      basicData: {
        name: data.name,
        phone: normalizedPhone,
        email: data.email || null,
      },
      unlockToken,
    })
    .returning();

  // Track marketer conversion
  if (marketerLinkId) {
    const [marketerLink] = await db
      .select()
      .from(marketerLinks)
      .where(eq(marketerLinks.id, marketerLinkId))
      .limit(1);

    if (marketerLink) {
      await db
        .update(marketerLinks)
        .set({
          conversions: marketerLink.conversions + 1,
          updatedAt: new Date()
        })
        .where(eq(marketerLinks.id, marketerLink.id));
    }
  }

  // Update landing page leads count
  if (data.landingPageId) {
    const [landingPage] = await db
      .select()
      .from(landingPages)
      .where(eq(landingPages.id, data.landingPageId))
      .limit(1);

    if (landingPage) {
      await db
        .update(landingPages)
        .set({
          leadsCount: landingPage.leadsCount + 1,
          updatedAt: new Date()
        })
        .where(eq(landingPages.id, landingPage.id));
    }
  }

  return { profile: newProfile, unlockToken };
}

/**
 * Verify unlock token
 */
export async function verifyUnlockToken(token: string, propertyId: string): Promise<boolean> {
  const [profile] = await db
    .select()
    .from(progressiveProfiles)
    .where(and(
      eq(progressiveProfiles.unlockToken, token),
      eq(progressiveProfiles.propertyInterestedId, propertyId)
    ))
    .limit(1);

  return !!profile;
}

/**
 * Create booking from landing page
 */
export async function createLandingPageBooking(data: {
  propertyId: string;
  visitorPhone: string;
  appointmentDate: Date;
  timeSlot: string;
  notes?: string;
}): Promise<typeof appointments.$inferSelect> {
  // Get property and seller
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, data.propertyId))
    .limit(1);

  if (!property || !property.sellerId) {
    throw new Error("Property or seller not found");
  }

  // Get or create user from progressive profile
  const normalizedPhone = data.visitorPhone.replace(/[^\d]/g, '');
  const [profile] = await db
    .select()
    .from(progressiveProfiles)
    .where(eq(progressiveProfiles.visitorPhone, normalizedPhone))
    .limit(1);

  let buyerId: string;
  
  if (profile?.userId) {
    buyerId = profile.userId;
  } else {
    // Create temporary user account
    const basicData = profile?.basicData as { name: string; phone: string; email?: string } || {
      name: "زائر",
      phone: normalizedPhone,
    };

    const [newUser] = await db
      .insert(users)
      .values({
        name: basicData.name,
        phone: normalizedPhone,
        email: basicData.email || null,
        role: "buyer",
        requiresPasswordReset: true,
      })
      .returning();

    buyerId = newUser.id;

    // Update profile with user ID
    if (profile) {
      await db
        .update(progressiveProfiles)
        .set({
          userId: buyerId,
          updatedAt: new Date()
        })
        .where(eq(progressiveProfiles.id, profile.id));
    }
  }

  // Create appointment
  const [appointment] = await db
    .insert(appointments)
    .values({
      buyerId,
      sellerId: property.sellerId,
      appointmentDate: data.appointmentDate,
      timeSlot: data.timeSlot,
      notes: data.notes || null,
      status: "pending",
    })
    .returning();

  // Create property lead
  await db.insert(propertyLeads).values({
    propertyId: data.propertyId,
    buyerId,
    sellerId: property.sellerId,
    source: "landing_page_booking",
    qualityScore: 70, // High quality since they booked
    status: "new",
    buyerPhone: normalizedPhone,
  });

  // Update landing page bookings count
  if (profile?.landingPageId) {
    const [landingPage] = await db
      .select()
      .from(landingPages)
      .where(eq(landingPages.id, profile.landingPageId))
      .limit(1);

    if (landingPage) {
      await db
        .update(landingPages)
        .set({
          bookingsCount: landingPage.bookingsCount + 1,
          updatedAt: new Date()
        })
        .where(eq(landingPages.id, landingPage.id));

      // Update marketer bookings
      if (profile.marketerLinkId) {
        const [marketerLink] = await db
          .select()
          .from(marketerLinks)
          .where(eq(marketerLinks.id, profile.marketerLinkId))
          .limit(1);

        if (marketerLink) {
          await db
            .update(marketerLinks)
            .set({
              bookings: marketerLink.bookings + 1,
              updatedAt: new Date()
            })
            .where(eq(marketerLinks.id, marketerLink.id));
        }
      }
    }
  }

  return appointment;
}

/**
 * Complete progressive profile (Stage 2: Preferences) and convert to buyer preference
 */
export async function completeProgressiveProfile(data: {
  visitorPhone: string;
  preferences: {
    city: string;
    districts?: string[];
    propertyType: string;
    budgetMin?: number;
    budgetMax?: number;
    transactionType?: string;
    rooms?: string;
    area?: string;
    [key: string]: any;
  };
}): Promise<{
  buyerPreference: typeof buyerPreferences.$inferSelect;
  userId: string;
}> {
  const normalizedPhone = data.visitorPhone.replace(/[^\d]/g, '');

  // Get profile
  const [profile] = await db
    .select()
    .from(progressiveProfiles)
    .where(eq(progressiveProfiles.visitorPhone, normalizedPhone))
    .limit(1);

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Get or create user
  let userId = profile.userId;
  if (!userId) {
    const basicData = profile.basicData as { name: string; phone: string; email?: string };
    const [newUser] = await db
      .insert(users)
      .values({
        name: basicData.name,
        phone: normalizedPhone,
        email: basicData.email || null,
        role: "buyer",
        requiresPasswordReset: true,
      })
      .returning();
    userId = newUser.id;
  }

  // Create buyer preference
  const [buyerPreference] = await db
    .insert(buyerPreferences)
    .values({
      userId,
      city: data.preferences.city,
      districts: data.preferences.districts || [],
      propertyType: data.preferences.propertyType,
      transactionType: data.preferences.transactionType || "buy",
      rooms: data.preferences.rooms || null,
      area: data.preferences.area || null,
      budgetMin: data.preferences.budgetMin || null,
      budgetMax: data.preferences.budgetMax || null,
      isActive: true,
    })
    .returning();

  // Update profile
  await db
    .update(progressiveProfiles)
    .set({
      stage: 3,
      preferences: data.preferences,
      isConvertedToBuyer: true,
      buyerPreferenceId: buyerPreference.id,
      userId,
      updatedAt: new Date()
    })
    .where(eq(progressiveProfiles.id, profile.id));

  return { buyerPreference, userId };
}

/**
 * Create landing page (admin function)
 */
export async function createLandingPage(data: {
  propertyId: string;
  slug?: string;
  formName?: string;
  createdBy?: string;
  lockedContent?: Record<string, boolean>;
}): Promise<typeof landingPages.$inferSelect> {
  // Generate slug if not provided
  const slug = data.slug || `property-${nanoid(8)}`;

  // Check if slug exists
  const [existing] = await db
    .select()
    .from(landingPages)
    .where(eq(landingPages.slug, slug))
    .limit(1);

  if (existing) {
    throw new Error("Slug already exists");
  }

  // Verify property exists
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, data.propertyId))
    .limit(1);

  if (!property) {
    throw new Error("Property not found");
  }

  const [landingPage] = await db
    .insert(landingPages)
    .values({
      propertyId: data.propertyId,
      slug,
      createdBy: data.createdBy || null,
      lockedContent: data.lockedContent || {
        map: true,
        floorPlan: true,
        sellerContact: true,
        extraImages: true,
      },
    })
    .returning();

  return landingPage;
}

/**
 * Create marketer link
 */
export async function createMarketerLink(data: {
  landingPageId: string;
  marketerId?: string;
  marketerName?: string;
  trackingCode?: string;
  commissionRate?: number;
}): Promise<typeof marketerLinks.$inferSelect> {
  const trackingCode = data.trackingCode || `ref-${nanoid(8)}`;

  // Check if tracking code exists
  const [existing] = await db
    .select()
    .from(marketerLinks)
    .where(eq(marketerLinks.trackingCode, trackingCode))
    .limit(1);

  if (existing) {
    throw new Error("Tracking code already exists");
  }

  const [marketerLink] = await db
    .insert(marketerLinks)
    .values({
      landingPageId: data.landingPageId,
      marketerId: data.marketerId || null,
      marketerName: data.marketerName || null,
      trackingCode,
      commissionRate: data.commissionRate || 0,
    })
    .returning();

  return marketerLink;
}

