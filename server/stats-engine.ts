// Deterministic Stats Engine - All users see the same numbers
// Uses daily seed + time of day for consistent calculations

class StatsEngine {
  private dailySeed: number = 0;
  private lastSeedDate: string = '';
  
  // Get daily seed based on date (same for entire day)
  private getDailySeed(): number {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.lastSeedDate) {
      // Create seed from date string
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
  
  // Calculate viewers based on time of day
  getViewers(): number {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const seed = this.getDailySeed();
    const monthMultiplier = this.getMonthPeriodMultiplier();
    
    // Time-based activity multiplier
    let activityMultiplier = 0;
    if (hour >= 0 && hour < 4) {
      activityMultiplier = 0.1;
    } else if (hour >= 4 && hour < 6) {
      activityMultiplier = 0.12;
    } else if (hour >= 6 && hour < 9) {
      activityMultiplier = 0.25;
    } else if (hour >= 9 && hour < 12) {
      activityMultiplier = 0.45;
    } else if (hour >= 12 && hour < 15) {
      activityMultiplier = 0.3;
    } else if (hour >= 15 && hour < 18) {
      activityMultiplier = 0.85;
    } else if (hour >= 18 && hour < 20) {
      activityMultiplier = 0.65;
    } else if (hour >= 20 && hour < 23) {
      activityMultiplier = 0.75;
    } else {
      activityMultiplier = 0.35;
    }
    
    // Add small deterministic variation based on minute
    const minuteVariation = this.seededRandom(seed, hour * 60 + minute) * 0.1;
    activityMultiplier += minuteVariation;
    
    const viewers = Math.floor((1300 + (4700 * activityMultiplier)) * monthMultiplier);
    return Math.max(1300, Math.min(6000, viewers));
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
