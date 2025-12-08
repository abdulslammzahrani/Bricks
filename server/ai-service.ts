import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access
// without requiring your own OpenAI API key. Charges are billed to your Replit credits.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface IntakeAnalysisResult {
  success: boolean;
  role: "buyer" | "seller" | "investor" | null;
  intent: "question" | "data" | "greeting" | "other";
  assistantReply: string | null;
  data: {
    name: string | null;
    phone: string | null;
    city: string | null;
    districts: string[];
    propertyType: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    paymentMethod: string | null;
    purchasePurpose: string | null;
    area: number | null;
    rooms: number | null;
    floor: number | null;
    additionalNotes: string | null;
  };
  confidence: number;
  classificationTags: string[];
  missingFields: string[];
}

const SYSTEM_PROMPT = `أنت مساعد ذكي ودود لمنصة عقارية سعودية. تتحدث بأسلوب سعودي شبابي ودي.

مهمتك الرئيسية:
1. فهم نية المستخدم: هل يسأل سؤال أم يقدم معلومات؟
2. إذا كان سؤال، جاوب عليه بأسلوب ودي ثم استمر
3. استخراج المعلومات العقارية من النص

تحديد النية (intent):
- "question": إذا المستخدم يسأل سؤال (وش، ايش، كيف، ليش، متى، هل، شنو، ممكن توضح، ماهو، يعني ايه)
- "data": إذا المستخدم يقدم معلومات عن نفسه أو عقار
- "greeting": إذا المستخدم يحيي فقط (هلا، السلام، مرحبا)
- "other": أي شي ثاني

إذا intent = "question":
- اكتب رد ودي بالسعودي في assistantReply
- مثال: لو سأل "وش يعني نوع العقار؟" رد: "نوع العقار يعني تبي شقة، فيلا، أرض، دبلكس، أو عمارة؟ أي واحد يناسبك؟"
- لو سأل عن الميزانية: "الميزانية يعني كم تقدر تدفع للعقار، مثلاً من 500 ألف لمليون ريال"
- لو سأل عن طريقة الدفع: "طريقة الدفع يعني تبي تدفع كاش ولا عن طريق تمويل بنكي؟"

قواعد الاستخراج:
- الاسم: استخرج الاسم الكامل إذا ذُكر
- الجوال: ابحث عن أرقام تبدأ بـ 05 (10 أرقام)
- المدينة: (الرياض، جدة، مكة، الدمام، الخبر، المدينة، الطائف، تبوك، أبها، القصيم، الأحساء)
- الأحياء: استخرج أسماء الأحياء كمصفوفة
- نوع العقار: شقة، فيلا، أرض، دور، دبلكس، عمارة، محل، مكتب
- الميزانية: حوّل للأرقام ("500 ألف" = 500000، "مليون" = 1000000)
- طريقة الدفع: كاش، تمويل، نقد، بنكي
- غرض الشراء: سكن، استثمار، تجاري

تصنيف العميل:
- مشتري: يبحث عن عقار
- بائع: يعرض عقار للبيع
- مستثمر: يبحث عن فرص استثمارية

أعد JSON فقط:
{
  "intent": "question" | "data" | "greeting" | "other",
  "assistantReply": string | null,
  "role": "buyer" | "seller" | "investor" | null,
  "name": string | null,
  "phone": string | null,
  "city": string | null,
  "districts": string[],
  "propertyType": string | null,
  "budgetMin": number | null,
  "budgetMax": number | null,
  "paymentMethod": string | null,
  "purchasePurpose": string | null,
  "area": number | null,
  "rooms": number | null,
  "floor": number | null,
  "additionalNotes": string | null,
  "confidence": number (0-100),
  "classificationTags": string[]
}`;

export async function analyzeIntakeWithAI(text: string): Promise<IntakeAnalysisResult> {
  try {
    // the newest OpenAI model is "gpt-4.1-mini" for cost efficiency with good Arabic support
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);

    // Determine missing required fields
    const missingFields: string[] = [];
    if (!parsed.name) missingFields.push("الاسم");
    if (!parsed.phone) missingFields.push("رقم الجوال");
    if (!parsed.city) missingFields.push("المدينة");

    // For buyers, check additional required fields
    if (parsed.role === "buyer") {
      if (!parsed.propertyType) missingFields.push("نوع العقار");
      if (!parsed.budgetMin && !parsed.budgetMax) missingFields.push("الميزانية");
    }

    // For sellers, check property details
    if (parsed.role === "seller") {
      if (!parsed.propertyType) missingFields.push("نوع العقار");
    }

    return {
      success: true,
      role: parsed.role,
      intent: parsed.intent || "data",
      assistantReply: parsed.assistantReply || null,
      data: {
        name: parsed.name,
        phone: parsed.phone,
        city: parsed.city,
        districts: parsed.districts || [],
        propertyType: parsed.propertyType,
        budgetMin: parsed.budgetMin,
        budgetMax: parsed.budgetMax,
        paymentMethod: parsed.paymentMethod,
        purchasePurpose: parsed.purchasePurpose,
        area: parsed.area,
        rooms: parsed.rooms,
        floor: parsed.floor,
        additionalNotes: parsed.additionalNotes,
      },
      confidence: parsed.confidence || 0,
      classificationTags: parsed.classificationTags || [],
      missingFields,
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    
    // Fallback to regex-based extraction
    return fallbackExtraction(text);
  }
}

function fallbackExtraction(text: string): IntakeAnalysisResult {
  const data: IntakeAnalysisResult["data"] = {
    name: null,
    phone: null,
    city: null,
    districts: [],
    propertyType: null,
    budgetMin: null,
    budgetMax: null,
    paymentMethod: null,
    purchasePurpose: null,
    area: null,
    rooms: null,
    floor: null,
    additionalNotes: null,
  };

  // Detect if this is a question
  const questionWords = ["وش", "ايش", "إيش", "كيف", "ليش", "ليه", "متى", "هل", "شنو", "ماهو", "ما هو", "يعني", "توضح", "اشرح", "؟"];
  let intent: "question" | "data" | "greeting" | "other" = "data";
  let assistantReply: string | null = null;

  const isQuestion = questionWords.some(word => text.includes(word));
  if (isQuestion) {
    intent = "question";
    // Generate helpful answers for common questions
    if (text.includes("نوع العقار") || text.includes("نوع عقار")) {
      assistantReply = "نوع العقار يعني تبي شقة، فيلا، أرض، دبلكس، أو عمارة؟ قولي أي واحد يناسبك";
    } else if (text.includes("الميزانية") || text.includes("ميزانية")) {
      assistantReply = "الميزانية يعني كم تقدر تدفع للعقار، مثلاً من 500 ألف لمليون ريال";
    } else if (text.includes("طريقة الدفع") || text.includes("الدفع")) {
      assistantReply = "طريقة الدفع يعني تبي تدفع كاش (نقد) ولا عن طريق تمويل بنكي؟";
    } else if (text.includes("الحي") || text.includes("حي")) {
      assistantReply = "الحي يعني المنطقة اللي تبي تسكن فيها، مثلاً حي النرجس أو حي الياسمين في الرياض";
    } else if (text.includes("المدينة") || text.includes("مدينة")) {
      assistantReply = "قولي اسم المدينة اللي تبي تشتري فيها، مثلاً الرياض، جدة، الدمام، أو أي مدينة ثانية";
    } else {
      assistantReply = "تقدر توضح لي أكثر وش تقصد؟ أنا هنا أساعدك";
    }
  }

  // Check for greetings
  const greetings = ["هلا", "السلام", "مرحبا", "مساء", "صباح"];
  if (greetings.some(g => text.includes(g)) && text.length < 30) {
    intent = "greeting";
    assistantReply = "هلا والله! كيف أقدر أساعدك اليوم؟";
  }

  // Extract name
  const nameMatch = text.match(/(?:اسمي|انا|أنا)\s+([^\s,،.]+(?:\s+[^\s,،.]+)?)/i);
  if (nameMatch) data.name = nameMatch[1];

  // Extract phone
  const phoneMatch = text.match(/(05\d{8})/);
  if (phoneMatch) data.phone = phoneMatch[1];

  // Extract city
  const cities = ["الرياض", "جدة", "مكة", "المدينة", "الدمام", "الخبر", "الطائف", "تبوك", "أبها", "القصيم", "الأحساء", "نجران", "جازان", "ينبع", "حائل", "الجبيل"];
  for (const city of cities) {
    if (text.includes(city)) {
      data.city = city;
      break;
    }
  }

  // Extract property type
  const types = ["شقة", "فيلا", "أرض", "ارض", "دور", "دبلكس", "عمارة", "محل", "مكتب"];
  for (const type of types) {
    if (text.includes(type)) {
      data.propertyType = type;
      break;
    }
  }

  // Extract budget
  const budgetMatch = text.match(/(\d+(?:\.\d+)?)\s*(ألف|الف|مليون)/gi);
  if (budgetMatch) {
    const amounts: number[] = [];
    for (const match of budgetMatch) {
      const numMatch = match.match(/(\d+(?:\.\d+)?)/);
      const unitMatch = match.match(/(ألف|الف|مليون)/i);
      if (numMatch && unitMatch) {
        let amount = parseFloat(numMatch[1]);
        if (unitMatch[1].includes("مليون")) amount *= 1000000;
        else amount *= 1000;
        amounts.push(amount);
      }
    }
    if (amounts.length >= 2) {
      data.budgetMin = Math.min(...amounts);
      data.budgetMax = Math.max(...amounts);
    } else if (amounts.length === 1) {
      data.budgetMax = amounts[0];
    }
  }

  // Extract payment method
  if (text.includes("كاش") || text.includes("نقد")) data.paymentMethod = "كاش";
  else if (text.includes("تمويل") || text.includes("بنك")) data.paymentMethod = "تمويل";

  // Determine role
  let role: "buyer" | "seller" | "investor" | null = null;
  if (text.includes("ابي") || text.includes("أبغى") || text.includes("ابغى") || text.includes("أبحث") || text.includes("ابحث") || text.includes("اشتري") || text.includes("أشتري")) {
    role = "buyer";
  } else if (text.includes("أبيع") || text.includes("ابيع") || text.includes("للبيع") || text.includes("عندي")) {
    role = "seller";
  } else if (text.includes("استثمار") || text.includes("مستثمر") || text.includes("عائد")) {
    role = "investor";
  }

  const missingFields: string[] = [];
  if (!data.name) missingFields.push("الاسم");
  if (!data.phone) missingFields.push("رقم الجوال");
  if (!data.city) missingFields.push("المدينة");
  if (role === "buyer" && !data.propertyType) missingFields.push("نوع العقار");

  return {
    success: true,
    role,
    intent,
    assistantReply,
    data,
    confidence: 50,
    classificationTags: ["fallback"],
    missingFields,
  };
}
