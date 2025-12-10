export interface ExampleSegment {
  text: string;
  color?: string;
  underline?: boolean;
}

export interface Example {
  id: string;
  segments: ExampleSegment[];
  fullText: string;
}

const saudiNames = [
  "محمد", "عبدالله", "فهد", "سلطان", "خالد", "عبدالرحمن", "سعود", "ناصر", "تركي", "بندر",
  "أحمد", "عمر", "يوسف", "إبراهيم", "علي", "حسن", "ماجد", "وليد", "فيصل", "سامي",
  "نورة", "سارة", "هند", "منى", "لمياء", "ريم", "أمل", "دانة", "لينا", "مريم",
  "جواهر", "عبير", "ريان", "ليلى", "فاطمة", "أسماء", "شهد", "هيا", "غادة", "وفاء"
];

const saudiLastNames = [
  "العتيبي", "القحطاني", "الشمري", "الدوسري", "الحربي", "المطيري", "الزهراني", "الغامدي",
  "السبيعي", "العنزي", "البقمي", "الرشيدي", "العمري", "الشهري", "المالكي", "البلوي",
  "القرني", "الأحمدي", "السلمي", "الثبيتي", "الجهني", "العجمي", "المري", "الهاجري"
];

const buyerPropertyTypes = [
  "شقة", "فيلا", "دبلكس", "أرض سكنية", "شقة تمليك", "فيلا دورين", 
  "شقة صغيرة", "تاون هاوس", "روف", "استوديو", "شقة فاخرة", "فيلا مودرن"
];

const sellerPropertyTypes = [
  "فيلا", "شقة", "أرض تجارية", "دبلكس", "عمارة سكنية", "أرض سكنية",
  "شقة فاخرة", "فيلا راقية", "محل تجاري", "مكتب", "استراحة", "مزرعة"
];

const investorPropertyTypes = [
  "عمارة سكنية", "أراضي تجارية", "مجمع سكني", "عقار مدر للدخل", "أرض استثمارية",
  "محلات تجارية", "مستودعات", "مول تجاري", "فندق", "شقق فندقية"
];

const cities = [
  { name: "الرياض", neighborhoods: ["الملقا", "الياسمين", "النرجس", "الورود", "العليا", "السليمانية", "المروج", "الصحافة", "النخيل", "حطين", "الربيع", "القيروان", "الرمال", "العارض"] },
  { name: "جدة", neighborhoods: ["الشاطئ", "الروضة", "الحمراء", "السلامة", "الفيصلية", "أبحر الشمالية", "أبحر الجنوبية", "الخالدية", "المرجان", "البساتين", "الأندلس", "الريان"] },
  { name: "الدمام", neighborhoods: ["الفيصلية", "الفيحاء", "الشاطئ", "الجلوية", "السيف", "المنار", "النور", "النزهة", "العمل", "المحمدية"] },
  { name: "الخبر", neighborhoods: ["العزيزية", "الثقبة", "الراكة", "الخزامى", "اليرموك", "الحزام الأخضر", "العقربية", "الكورنيش", "الهدا"] },
  { name: "مكة المكرمة", neighborhoods: ["العزيزية", "الشوقية", "النسيم", "الرصيفة", "العوالي", "الكعكية", "الحمراء", "الستين", "الزاهر"] },
  { name: "المدينة المنورة", neighborhoods: ["العزيزية", "قباء", "العنبرية", "الحرة الشرقية", "الدفاع", "المبعوث", "العريض", "الجابرة"] },
  { name: "أبها", neighborhoods: ["المنسك", "الخالدية", "الموظفين", "الورود", "السد", "الربوة", "شمسان", "النميص"] },
  { name: "الطائف", neighborhoods: ["الفيصلية", "الخالدية", "شبرا", "نخب", "الحوية", "الشرقية", "القيم", "الريان"] },
  { name: "تبوك", neighborhoods: ["المروج", "الفيصلية", "السليمانية", "الروضة", "المنشية", "الأخضر"] },
  { name: "بريدة", neighborhoods: ["الصفراء", "الريان", "الخليج", "الإسكان", "النخيل", "السالمية"] },
  { name: "حائل", neighborhoods: ["المحطة", "البادية", "الخزامى", "الورود", "السمراء", "المنتزه"] },
  { name: "جازان", neighborhoods: ["الشاطئ", "المنطقة الصناعية", "الروضة", "النسيم", "السويس"] },
  { name: "نجران", neighborhoods: ["الفيصلية", "الفهد", "المنطقة الصناعية", "شرورة"] },
  { name: "الإحساء", neighborhoods: ["الهفوف", "المبرز", "العيون", "الجفر", "المنيزلة"] },
  { name: "القطيف", neighborhoods: ["سيهات", "القديح", "الجارودية", "صفوى", "العوامية"] },
  { name: "خميس مشيط", neighborhoods: ["الراقي", "الموسى", "النسيم", "الوسام", "أحد رفيدة"] },
  { name: "ينبع", neighborhoods: ["الصناعية", "ينبع البحر", "ينبع النخل", "الشرم"] }
];

const paymentMethods = ["كاش", "تمويل عقاري", "تمويل", "نقد", "كاش أو تمويل"];
const roomCounts = ["3 غرف", "4 غرف", "5 غرف", "6 غرف", "غرفتين", "7 غرف", "8 غرف"];
const features = ["ومسبح", "وحوش", "ومصعد", "وملحق", "وسطح", "ومجلس", "وصالة", "وغرفة خادمة", "وموقف خاص"];

function generatePhone(): string {
  const prefixes = ["050", "053", "054", "055", "056", "057", "058", "059", "٠٥٠", "٠٥٣", "٠٥٤", "٠٥٥", "٠٥٦"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const mid = Math.floor(Math.random() * 900 + 100).toString();
  return `${prefix}${mid}****`;
}

function generateBudget(type: "buyer" | "seller" | "investor"): { text: string; min: number; max: number } {
  if (type === "investor") {
    const ranges = [
      { text: "5 إلى 10 مليون", min: 5000000, max: 10000000 },
      { text: "8 إلى 15 مليون", min: 8000000, max: 15000000 },
      { text: "10 إلى 20 مليون", min: 10000000, max: 20000000 },
      { text: "15 إلى 30 مليون", min: 15000000, max: 30000000 },
      { text: "3 إلى 8 مليون", min: 3000000, max: 8000000 },
      { text: "20 إلى 50 مليون", min: 20000000, max: 50000000 },
    ];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }
  
  const amounts = [
    { text: "350 ألف", min: 350000, max: 350000 },
    { text: "450 ألف", min: 450000, max: 450000 },
    { text: "550 ألف", min: 550000, max: 550000 },
    { text: "650 ألف", min: 650000, max: 650000 },
    { text: "750 ألف", min: 750000, max: 750000 },
    { text: "850 ألف", min: 850000, max: 850000 },
    { text: "مليون", min: 1000000, max: 1000000 },
    { text: "مليون و200", min: 1200000, max: 1200000 },
    { text: "مليون ونص", min: 1500000, max: 1500000 },
    { text: "مليون و800", min: 1800000, max: 1800000 },
    { text: "2 مليون", min: 2000000, max: 2000000 },
    { text: "2.5 مليون", min: 2500000, max: 2500000 },
    { text: "3 مليون", min: 3000000, max: 3000000 },
    { text: "3.5 مليون", min: 3500000, max: 3500000 },
    { text: "4 مليون", min: 4000000, max: 4000000 },
    { text: "5 مليون", min: 5000000, max: 5000000 },
  ];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBuyerExample(id: number): Example {
  const city = getRandomItem(cities);
  const neighborhood = getRandomItem(city.neighborhoods);
  const neighborhood2 = getRandomItem(city.neighborhoods.filter(n => n !== neighborhood));
  const propertyType = getRandomItem(buyerPropertyTypes);
  const budget = generateBudget("buyer");
  const payment = getRandomItem(paymentMethods);
  const name = getRandomItem(saudiNames);
  const lastName = Math.random() > 0.5 ? " " + getRandomItem(saudiLastNames) : "";
  const phone = generatePhone();
  const rooms = Math.random() > 0.5 ? getRandomItem(roomCounts) : "";
  
  const templates = [
    () => ({
      segments: [
        { text: "أبحث عن " },
        { text: propertyType, color: "#3b82f6", underline: true },
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " حي " },
        { text: neighborhood, color: "#22c55e", underline: true },
        ...(neighborhood2 ? [{ text: " أو " }, { text: neighborhood2, color: "#22c55e", underline: true }] : []),
        ...(rooms ? [{ text: ` ، ${rooms}` }] : []),
        { text: " ، الميزانية " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " " },
        { text: payment, color: "#3b82f6", underline: true },
        { text: " - " },
        { text: name + lastName, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `أبحث عن ${propertyType} في ${city.name} حي ${neighborhood}${neighborhood2 ? ` أو ${neighborhood2}` : ""}${rooms ? ` ، ${rooms}` : ""} ، الميزانية ** ${payment} - ${name}${lastName} ${phone}`
    }),
    () => ({
      segments: [
        { text: "محتاج " },
        { text: propertyType, color: "#3b82f6", underline: true },
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " " },
        { text: neighborhood, color: "#22c55e", underline: true },
        { text: " ، معي " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " " },
        { text: payment, color: "#3b82f6", underline: true },
        { text: " .. " },
        { text: name + lastName, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `محتاج ${propertyType} في ${city.name} ${neighborhood} ، معي ** ${payment} .. ${name}${lastName} ${phone}`
    }),
    () => ({
      segments: [
        { text: "يا شباب مين يوصلني " },
        { text: propertyType, color: "#3b82f6", underline: true },
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " " },
        { text: neighborhood, color: "#22c55e", underline: true },
        { text: "؟ الميزانية لين " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " - " },
        { text: name, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `يا شباب مين يوصلني ${propertyType} في ${city.name} ${neighborhood}؟ الميزانية لين ** - ${name} ${phone}`
    }),
    () => ({
      segments: [
        { text: "ودي ب" },
        { text: propertyType, color: "#3b82f6", underline: true },
        ...(rooms ? [{ text: ` ${rooms}` }] : []),
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " " },
        { text: neighborhood, color: "#22c55e", underline: true },
        { text: " ، السعر ما يتجاوز " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " " },
        { text: payment, color: "#3b82f6", underline: true },
        { text: " - " },
        { text: name, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `ودي ب${propertyType}${rooms ? ` ${rooms}` : ""} في ${city.name} ${neighborhood} ، السعر ما يتجاوز ** ${payment} - ${name} ${phone}`
    }),
    () => ({
      segments: [
        { text: "السلام عليكم ، أنا " },
        { text: name + lastName, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
        { text: " ، أدور " },
        { text: propertyType, color: "#3b82f6", underline: true },
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " " },
        { text: neighborhood, color: "#22c55e", underline: true },
        { text: " ، معي " },
        { text: "**", color: "#22c55e", underline: true },
      ],
      fullText: `السلام عليكم ، أنا ${name}${lastName} ${phone} ، أدور ${propertyType} في ${city.name} ${neighborhood} ، معي **`
    }),
  ];
  
  const template = getRandomItem(templates);
  const result = template();
  return { id: `buyer-${id}`, ...result };
}

function generateSellerExample(id: number): Example {
  const city = getRandomItem(cities);
  const neighborhood = getRandomItem(city.neighborhoods);
  const propertyType = getRandomItem(sellerPropertyTypes);
  const budget = generateBudget("seller");
  const name = getRandomItem(saudiNames);
  const lastName = Math.random() > 0.5 ? " " + getRandomItem(saudiLastNames) : "";
  const phone = generatePhone();
  const rooms = getRandomItem(roomCounts);
  const feature = Math.random() > 0.5 ? getRandomItem(features) : "";
  const areas = ["300 متر", "350 متر", "400 متر", "450 متر", "500 متر", "600 متر", "700 متر", "800 متر"];
  const area = getRandomItem(areas);
  
  const templates = [
    () => ({
      segments: [
        { text: "عندي " },
        { text: propertyType, color: "#3b82f6", underline: true },
        { text: " للبيع في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " " },
        { text: neighborhood, color: "#22c55e", underline: true },
        { text: ` ، ${rooms}` },
        ...(feature ? [{ text: ` ${feature}` }] : []),
        { text: ` ، مساحة ${area} ، السعر ` },
        { text: "**", color: "#22c55e", underline: true },
        { text: " - " },
        { text: name + lastName, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `عندي ${propertyType} للبيع في ${city.name} ${neighborhood} ، ${rooms}${feature ? ` ${feature}` : ""} ، مساحة ${area} ، السعر ** - ${name}${lastName} ${phone}`
    }),
    () => ({
      segments: [
        { text: "للبيع " },
        { text: propertyType, color: "#3b82f6", underline: true },
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " حي " },
        { text: neighborhood, color: "#22c55e", underline: true },
        { text: ` ، ${rooms} ، تشطيب ممتاز ، ` },
        { text: "**", color: "#22c55e", underline: true },
        { text: " قابل للتفاوض .. " },
        { text: name, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `للبيع ${propertyType} في ${city.name} حي ${neighborhood} ، ${rooms} ، تشطيب ممتاز ، ** قابل للتفاوض .. ${name} ${phone}`
    }),
    () => ({
      segments: [
        { text: propertyType, color: "#3b82f6", underline: true },
        { text: " جديد للبيع في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " " },
        { text: neighborhood, color: "#22c55e", underline: true },
        { text: ` ، ${rooms}` },
        ...(feature ? [{ text: ` ${feature}` }] : []),
        { text: " ، " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " - المالك " },
        { text: name, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `${propertyType} جديد للبيع في ${city.name} ${neighborhood} ، ${rooms}${feature ? ` ${feature}` : ""} ، ** - المالك ${name} ${phone}`
    }),
    () => ({
      segments: [
        { text: "للبيع المستعجل " },
        { text: propertyType, color: "#3b82f6", underline: true },
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " " },
        { text: neighborhood, color: "#22c55e", underline: true },
        { text: ` ، ${rooms} ، مساحة ${area} ، ` },
        { text: "**", color: "#22c55e", underline: true },
        { text: " .. " },
        { text: name + lastName, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `للبيع المستعجل ${propertyType} في ${city.name} ${neighborhood} ، ${rooms} ، مساحة ${area} ، ** .. ${name}${lastName} ${phone}`
    }),
  ];
  
  const template = getRandomItem(templates);
  const result = template();
  return { id: `seller-${id}`, ...result };
}

function generateInvestorExample(id: number): Example {
  const city = getRandomItem(cities);
  const city2 = getRandomItem(cities.filter(c => c.name !== city.name));
  const propertyType = getRandomItem(investorPropertyTypes);
  const budget = generateBudget("investor");
  const name = getRandomItem(saudiNames);
  const lastName = Math.random() > 0.5 ? " " + getRandomItem(saudiLastNames) : "";
  const phone = generatePhone();
  const returns = ["6%+", "7%+", "8%+", "9%+", "10%+"];
  const returnRate = getRandomItem(returns);
  
  const templates = [
    () => ({
      segments: [
        { text: "مستثمر أبحث عن " },
        { text: propertyType, color: "#d97706", underline: true },
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " أو " },
        { text: city2.name, color: "#22c55e", underline: true },
        { text: " ، رأس المال " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " ، أبي عائد " },
        { text: returnRate, color: "#d97706", underline: true },
        { text: " - " },
        { text: name + lastName, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `مستثمر أبحث عن ${propertyType} في ${city.name} أو ${city2.name} ، رأس المال ** ، أبي عائد ${returnRate} - ${name}${lastName} ${phone}`
    }),
    () => ({
      segments: [
        { text: "مهتم ب" },
        { text: propertyType, color: "#d97706", underline: true },
        { text: " في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " ، الميزانية " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " ، العائد المطلوب " },
        { text: returnRate, color: "#d97706", underline: true },
        { text: " - " },
        { text: name, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `مهتم ب${propertyType} في ${city.name} ، الميزانية ** ، العائد المطلوب ${returnRate} - ${name} ${phone}`
    }),
    () => ({
      segments: [
        { text: "أبحث عن فرصة استثمارية في " },
        { text: propertyType, color: "#d97706", underline: true },
        { text: " ب" },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " ، معي " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " ، أبي عائد لا يقل عن " },
        { text: returnRate, color: "#d97706", underline: true },
        { text: " .. " },
        { text: name + lastName, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `أبحث عن فرصة استثمارية في ${propertyType} ب${city.name} ، معي ** ، أبي عائد لا يقل عن ${returnRate} .. ${name}${lastName} ${phone}`
    }),
    () => ({
      segments: [
        { text: "عندي سيولة " },
        { text: "**", color: "#22c55e", underline: true },
        { text: " وأبي " },
        { text: propertyType, color: "#d97706", underline: true },
        { text: " مؤجر في " },
        { text: city.name, color: "#22c55e", underline: true },
        { text: " ، العائد المتوقع " },
        { text: returnRate, color: "#d97706", underline: true },
        { text: " - " },
        { text: name, color: "#f97316", underline: true },
        { text: " " },
        { text: phone, color: "#f97316", underline: true },
      ],
      fullText: `عندي سيولة ** وأبي ${propertyType} مؤجر في ${city.name} ، العائد المتوقع ${returnRate} - ${name} ${phone}`
    }),
  ];
  
  const template = getRandomItem(templates);
  const result = template();
  return { id: `investor-${id}`, ...result };
}

// Generate 50 examples for each type
export const buyerExamples: Example[] = Array.from({ length: 50 }, (_, i) => generateBuyerExample(i + 1));
export const sellerExamples: Example[] = Array.from({ length: 50 }, (_, i) => generateSellerExample(i + 1));
export const investorExamples: Example[] = Array.from({ length: 50 }, (_, i) => generateInvestorExample(i + 1));

// Shuffle function using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get shuffled examples with localStorage tracking to prevent showing same example more than twice
export function getShuffledExamples(type: "buyer" | "seller" | "investor"): Example[] {
  const storageKey = `tatabuk_viewed_${type}`;
  const examples = type === "buyer" ? buyerExamples : type === "seller" ? sellerExamples : investorExamples;
  
  // Get viewed examples from localStorage
  let viewedCount: Record<string, number> = {};
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      viewedCount = JSON.parse(stored);
    }
  } catch (e) {
    viewedCount = {};
  }
  
  // Filter out examples that have been shown twice
  const availableExamples = examples.filter(ex => (viewedCount[ex.id] || 0) < 2);
  
  // If all examples have been shown twice, reset
  if (availableExamples.length === 0) {
    viewedCount = {};
    try {
      localStorage.setItem(storageKey, JSON.stringify(viewedCount));
    } catch (e) {}
    return shuffleArray(examples);
  }
  
  return shuffleArray(availableExamples);
}

// Mark an example as viewed
export function markExampleViewed(type: "buyer" | "seller" | "investor", exampleId: string): void {
  const storageKey = `tatabuk_viewed_${type}`;
  
  try {
    let viewedCount: Record<string, number> = {};
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      viewedCount = JSON.parse(stored);
    }
    viewedCount[exampleId] = (viewedCount[exampleId] || 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify(viewedCount));
  } catch (e) {}
}

