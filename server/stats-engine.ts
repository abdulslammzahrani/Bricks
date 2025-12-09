// Deterministic Stats Engine - All users see the same numbers
// Uses daily seed + time of day for consistent calculations
// Natural-looking viewer changes using smooth random walk algorithm

class StatsEngine {
  private dailySeed: number = 0;
  private lastSeedDate: string = '';
  
  // Get daily seed based on date (same for entire day)
  private getDailySeed(): number {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.lastSeedDate) {
      let seed = 0;
      for (let i = 0; i < today.length; i++) {
        seed = ((seed << 5) - seed) + today.charCodeAt(i);
        seed = seed & seed;
      }
      this.dailySeed = Math.abs(seed);
      this.lastSeedDate = today;
    }
    return this.dailySeed;
  }
  
  // Seeded random number generator (deterministic)
  private seededRandom(seed: number, offset: number = 0): number {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  }
  
  // Get month period multiplier (salary periods boost activity)
  private getMonthPeriodMultiplier(): number {
    const day = new Date().getDate();
    if (day >= 25 && day <= 28) {
      return 1.4; // Government salaries
    } else if (day >= 1 && day <= 5) {
      return 1.3; // Private sector salaries
    } else if (day >= 6 && day <= 10) {
      return 1.1; // After salaries
    } else if (day >= 20 && day <= 24) {
      return 0.85; // Before salary
    }
    return 1.0;
  }
  
  // Get base viewers for current hour (smooth curve through day)
  private getBaseViewersForHour(hour: number, minute: number): number {
    // Natural activity curve through the day
    // Peak hours: 15-18 (afternoon), Secondary peak: 20-22 (evening)
    // Low hours: 0-6 (night), 12-14 (lunch)
    
    const hourlyBases: { [key: number]: number } = {
      0: 1400, 1: 1350, 2: 1320, 3: 1300, 4: 1310, 5: 1350,
      6: 1500, 7: 1800, 8: 2200, 9: 2800, 10: 3200, 11: 3400,
      12: 3000, 13: 2800, 14: 3100, 15: 4200, 16: 4800, 17: 5200,
      18: 4600, 19: 4200, 20: 4400, 21: 4000, 22: 3200, 23: 2200
    };
    
    const currentBase = hourlyBases[hour] || 2500;
    const nextHour = (hour + 1) % 24;
    const nextBase = hourlyBases[nextHour] || 2500;
    
    // Smooth interpolation between hours
    const progress = minute / 60;
    return Math.floor(currentBase + (nextBase - currentBase) * progress);
  }
  
  // Calculate viewers with natural-looking changes
  getViewers(): number {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const seed = this.getDailySeed();
    const monthMultiplier = this.getMonthPeriodMultiplier();
    
    // Get smooth base for current time
    const baseViewers = this.getBaseViewersForHour(hour, minute);
    
    // Time slot: changes every 5 seconds (same for all users)
    const timeSlot = Math.floor((hour * 3600 + minute * 60 + second) / 5);
    
    // Natural random walk algorithm:
    // Build up small changes over multiple slots to create smooth transitions
    let cumulativeChange = 0;
    
    // Look at last 12 slots (1 minute history) to build smooth curve
    for (let i = 0; i < 12; i++) {
      const slotSeed = seed + (timeSlot - i) * 7919; // Prime number for better distribution
      const slotRandom = this.seededRandom(slotSeed, i * 13);
      
      // 70% chance: small change (1-3)
      // 20% chance: no change
      // 10% chance: slightly larger change (4-7)
      let change = 0;
      if (slotRandom < 0.7) {
        // Small change: 1-3
        change = Math.floor(this.seededRandom(slotSeed, i * 17) * 3) + 1;
      } else if (slotRandom < 0.9) {
        // No change
        change = 0;
      } else {
        // Slightly larger change: 4-7
        change = Math.floor(this.seededRandom(slotSeed, i * 23) * 4) + 4;
      }
      
      // Direction: slightly biased towards current trend
      const directionRandom = this.seededRandom(slotSeed, i * 31);
      if (directionRandom < 0.48) {
        change = -change; // Decrease
      }
      // else increase (52% bias towards increase during work hours)
      
      // Recent changes have more weight
      const weight = 1 - (i * 0.06);
      cumulativeChange += change * weight;
    }
    
    // Apply cumulative change with dampening
    const smoothChange = Math.floor(cumulativeChange * 0.4);
    
    // Final calculation
    let viewers = Math.floor(baseViewers * monthMultiplier) + smoothChange;
    
    // Ensure within reasonable bounds
    const minViewers = Math.floor(1300 * monthMultiplier);
    const maxViewers = Math.floor(5500 * monthMultiplier);
    
    return Math.max(minViewers, Math.min(maxViewers, viewers));
  }
  
  // Calculate requests - grows through the day
  getRequests(): number {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const minutesSinceMidnight = hour * 60 + minute;
    const seed = this.getDailySeed();
    const monthMultiplier = this.getMonthPeriodMultiplier();
    
    // Base calculation: grows through the day
    let baseRequests = 0;
    if (hour >= 0 && hour < 6) {
      baseRequests = Math.floor(minutesSinceMidnight * 0.04);
    } else if (hour >= 6 && hour < 12) {
      baseRequests = 15 + Math.floor((minutesSinceMidnight - 360) * 0.2);
    } else if (hour >= 12 && hour < 18) {
      baseRequests = 90 + Math.floor((minutesSinceMidnight - 720) * 0.28);
    } else {
      baseRequests = 190 + Math.floor((minutesSinceMidnight - 1080) * 0.2);
    }
    
    // Add deterministic variation
    const variation = Math.floor(this.seededRandom(seed, minutesSinceMidnight) * 8);
    const requests = Math.floor((baseRequests + variation) * monthMultiplier);
    
    return Math.max(0, Math.min(300, requests));
  }
  
  // Calculate deals - grows through the day, linked to requests
  getDeals(): number {
    const now = new Date();
    const hour = now.getHours();
    const seed = this.getDailySeed();
    const monthMultiplier = this.getMonthPeriodMultiplier();
    const requests = this.getRequests();
    
    // Conversion rate varies by time
    let conversionRate = 0.05;
    if (hour >= 15 && hour < 20) {
      conversionRate = 0.07;
    } else if (hour >= 20 && hour < 23) {
      conversionRate = 0.06;
    } else if (hour < 9) {
      conversionRate = 0.03;
    }
    
    // Time progression (deals accumulate through day)
    const hourMultiplier = Math.min(1, hour / 18);
    let deals = Math.floor(requests * conversionRate * monthMultiplier * (0.3 + hourMultiplier * 0.7));
    
    // Add small deterministic variation
    const variation = Math.floor(this.seededRandom(seed, hour * 100) * 2);
    deals += variation;
    
    return Math.max(0, Math.min(25, deals));
  }
  
  // Get all stats at once
  getAllStats(): { viewers: number; requests: number; deals: number; timestamp: number } {
    return {
      viewers: this.getViewers(),
      requests: this.getRequests(),
      deals: this.getDeals(),
      timestamp: Date.now()
    };
  }
}

// Singleton instance
export const statsEngine = new StatsEngine();
