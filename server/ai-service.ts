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
    email: string | null;
    city: string | null;
    districts: string[];
    propertyType: string | null;
    transactionType: string | null; // buy, rent (شراء أو تأجير)
    budgetMin: number | null;
    budgetMax: number | null;
    paymentMethod: string | null;
    purchasePurpose: string | null;
    purchaseTimeline: string | null; // asap, within_month, within_3months, etc
    clientType: string | null; // direct, broker (مباشر أو وسيط)
    area: number | null;
    rooms: number | null;
    floor: number | null;
    additionalNotes: string | null;
  };
  confidence: number;
  classificationTags: string[];
  missingFields: string[];
}

const SYSTEM_PROMPT = `أنت مساعد عقاري سعودي ذكي. تجمع 5 حقول أساسية فقط بأقل رسائل.

## الحقول المطلوبة (5 فقط):
1. name: الاسم
2. phone: رقم جوال (05xxxxxxxx)
3. propertyType: شقة/فيلا/أرض
4. city أو district: المدينة أو الحي
5. budget: الميزانية

## تسلسل المحادثة:
رسالة 1: "هلا! وش اسمك؟ ورقم جوالك؟ وتبي شقة ولا فيلا ولا أرض؟"
رسالة 2: "تمام! في أي مدينة أو حي؟ وكم ميزانيتك تقريباً؟"
عند الاكتمال: لا ترسل رسالة تأكيد - النظام سيعرض بطاقة تأكيد تلقائياً

## استخراج البيانات:
- "معك محمد/انا سعد/عبدالرحمن العامري" → name
- 05xxxxxxxx → phone
- "فله/فيلا/شقه/شقة/ارض" → propertyType
- "الرياض/جده/الدمام/الصفا/النرجس" → city أو district
- "60 ألف/500 ألف/مليون" → budgetMax (60000/500000/1000000)

## قواعد:
1. لا تسأل عن معلومة موجودة بالسياق
2. اسأل 3 أسئلة معاً
3. لا تقل "سجلنا طلبك" - النظام سيتولى ذلك
4. إذا كلام غير واضح: "ممكن توضح؟"

أعد JSON فقط:
{"intent":"greeting|question|data","assistantReply":"الرد","role":"buyer|seller|investor"|null,"name":null,"phone":null,"email":null,"city":null,"districts":[],"propertyType":null,"transactionType":null,"budgetMin":null,"budgetMax":null,"paymentMethod":null,"purchasePurpose":null,"purchaseTimeline":null,"clientType":null,"area":null,"rooms":null,"floor":null,"additionalNotes":null,"confidence":0,"classificationTags":[]}`;

export interface ConversationContext {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  districts?: string[];
  propertyType?: string;
  transactionType?: string;
  budgetMin?: number;
  budgetMax?: number;
  paymentMethod?: string;
  purchasePurpose?: string;
  purchaseTimeline?: string;
  clientType?: string;
  area?: number;
  rooms?: number;
  role?: string;
}

export async function analyzeIntakeWithAI(text: string, context?: ConversationContext): Promise<IntakeAnalysisResult> {
  try {
    // Build context message if we have previously extracted data
    let contextMessage = "";
    if (context && Object.keys(context).length > 0) {
      const contextParts: string[] = [];
      if (context.name) contextParts.push(`الاسم: ${context.name}`);
      if (context.phone) contextParts.push(`الجوال: ${context.phone}`);
      if (context.email) contextParts.push(`الايميل: ${context.email}`);
      if (context.city) contextParts.push(`المدينة: ${context.city}`);
      if (context.districts && context.districts.length > 0) contextParts.push(`الأحياء: ${context.districts.join(", ")}`);
      if (context.propertyType) contextParts.push(`نوع العقار: ${context.propertyType}`);
      if (context.transactionType) contextParts.push(`نوع المعاملة: ${context.transactionType === 'buy' ? 'شراء' : 'تأجير'}`);
      if (context.budgetMin) contextParts.push(`الميزانية من: ${context.budgetMin}`);
      if (context.budgetMax) contextParts.push(`الميزانية إلى: ${context.budgetMax}`);
      if (context.paymentMethod) contextParts.push(`طريقة الدفع: ${context.paymentMethod}`);
      if (context.purchasePurpose) contextParts.push(`الغرض: ${context.purchasePurpose}`);
      if (context.purchaseTimeline) contextParts.push(`وقت الشراء: ${context.purchaseTimeline}`);
      if (context.clientType) contextParts.push(`نوع العميل: ${context.clientType === 'direct' ? 'مباشر' : 'وسيط'}`);
      if (context.area) contextParts.push(`المساحة: ${context.area}`);
      if (context.rooms) contextParts.push(`الغرف: ${context.rooms}`);
      if (context.role) contextParts.push(`الدور: ${context.role}`);
      
      if (contextParts.length > 0) {
        contextMessage = `\n\n[معلومات سابقة من المحادثة - لا تسأل عنها مرة أخرى]:\n${contextParts.join("\n")}\n\n[الرسالة الجديدة]:\n`;
      }
    }
    
    const fullMessage = contextMessage + text;
    
    // Using GPT-4o-mini for cost efficiency with good Arabic understanding
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: fullMessage },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 350,
      temperature: 0.3,
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
    // Email is optional, so don't add to missing fields
    if (!parsed.propertyType) missingFields.push("نوع العقار");
    if (!parsed.transactionType) missingFields.push("شراء أو تأجير");
    if (!parsed.budgetMin && !parsed.budgetMax) missingFields.push("الميزانية");
    if (!parsed.purchaseTimeline) missingFields.push("وقت الشراء");
    if (!parsed.clientType) missingFields.push("هل أنت وسيط أو مباشر");

    // City is optional but helpful
    // if (!parsed.city) missingFields.push("المدينة");

    return {
      success: true,
      role: parsed.role,
      intent: parsed.intent || "data",
      assistantReply: parsed.assistantReply || null,
      data: {
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || null,
        city: parsed.city,
        districts: parsed.districts || [],
        propertyType: parsed.propertyType,
        transactionType: parsed.transactionType || null,
        budgetMin: parsed.budgetMin,
        budgetMax: parsed.budgetMax,
        paymentMethod: parsed.paymentMethod,
        purchasePurpose: parsed.purchasePurpose,
        purchaseTimeline: parsed.purchaseTimeline || null,
        clientType: parsed.clientType || null,
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
    email: null,
    city: null,
    districts: [],
    propertyType: null,
    transactionType: null,
    budgetMin: null,
    budgetMax: null,
    paymentMethod: null,
    purchasePurpose: null,
    purchaseTimeline: null,
    clientType: null,
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

// Voice transcription using OpenAI Whisper
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // Create a File object from the buffer
    const file = new File([audioBuffer], "audio.webm", { type: mimeType });
    
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "ar", // Arabic
      response_format: "text",
    });

    return {
      success: true,
      text: response,
    };
  } catch (error: any) {
    console.error("Whisper transcription error:", error);
    return {
      success: false,
      error: error.message || "فشل في تحويل الصوت لنص",
    };
  }
}
