// Comprehensive Saudi Arabia Cities and Neighborhoods Database
// المدن والأحياء في المملكة العربية السعودية

export type Direction = "north" | "south" | "east" | "west" | "center";

export interface Neighborhood {
  name: string;
  nameEn?: string;
  direction?: Direction;
}

// تسميات الاتجاهات بالعربية
export const directionLabels: Record<Direction, string> = {
  north: "شمال",
  south: "جنوب",
  east: "شرق",
  west: "غرب",
  center: "وسط"
};

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface City {
  name: string;
  nameEn: string;
  region: string;
  coordinates: Coordinates;
  neighborhoods: Neighborhood[];
}

export const saudiCities: City[] = [
  // ==================== منطقة الرياض ====================
  {
    name: "الرياض",
    nameEn: "Riyadh",
    region: "منطقة الرياض",
    coordinates: { lat: 24.7136, lng: 46.6753 },
    neighborhoods: [
      // شمال الرياض
      { name: "النرجس", nameEn: "Al Narjis", direction: "north" },
      { name: "الياسمين", nameEn: "Al Yasmin", direction: "north" },
      { name: "الملقا", nameEn: "Al Malqa", direction: "north" },
      { name: "حطين", nameEn: "Hittin", direction: "north" },
      { name: "الصحافة", nameEn: "Al Sahafa", direction: "north" },
      { name: "الغدير", nameEn: "Al Ghadeer", direction: "north" },
      { name: "النخيل", nameEn: "Al Nakheel", direction: "north" },
      { name: "العقيق", nameEn: "Al Aqiq", direction: "north" },
      { name: "المروج", nameEn: "Al Muruj", direction: "north" },
      { name: "الرحمانية", nameEn: "Al Rahmaniyah", direction: "north" },
      { name: "الربيع", nameEn: "Al Rabie", direction: "north" },
      { name: "القيروان", nameEn: "Al Qairawan", direction: "north" },
      { name: "العارض", nameEn: "Al Arid", direction: "north" },
      { name: "الندى", nameEn: "Al Nada", direction: "north" },
      { name: "الوادي", nameEn: "Al Wadi", direction: "north" },
      { name: "الفلاح", nameEn: "Al Falah", direction: "north" },
      // وسط الرياض
      { name: "الورود", nameEn: "Al Wurud", direction: "center" },
      { name: "السليمانية", nameEn: "Al Sulaymaniyah", direction: "center" },
      { name: "الصفا", nameEn: "Al Safa", direction: "center" },
      { name: "الحمراء", nameEn: "Al Hamra", direction: "center" },
      { name: "المصيف", nameEn: "Al Masif", direction: "center" },
      { name: "الربوة", nameEn: "Al Rabwa", direction: "center" },
      { name: "السفارات", nameEn: "Al Safarat", direction: "center" },
      { name: "الملز", nameEn: "Al Malaz", direction: "center" },
      { name: "العليا", nameEn: "Al Olaya", direction: "center" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah", direction: "center" },
      { name: "المربع", nameEn: "Al Murabba", direction: "center" },
      { name: "الديرة", nameEn: "Al Dirah", direction: "center" },
      { name: "البطحاء", nameEn: "Al Batha", direction: "center" },
      { name: "المعذر", nameEn: "Al Mathar", direction: "center" },
      { name: "أم الحمام", nameEn: "Um Al Hammam", direction: "center" },
      { name: "الشعلان", nameEn: "Al Shalaan", direction: "center" },
      { name: "الضباب", nameEn: "Al Dabab", direction: "center" },
      // شرق الرياض
      { name: "الشهداء", nameEn: "Al Shuhada", direction: "east" },
      { name: "النموذجية", nameEn: "Al Namudhajiya", direction: "east" },
      { name: "الروضة", nameEn: "Al Rawdah", direction: "east" },
      { name: "المنصورة", nameEn: "Al Mansoura", direction: "east" },
      { name: "المونسية", nameEn: "Al Munsiyah", direction: "east" },
      { name: "قرطبة", nameEn: "Qurtuba", direction: "east" },
      { name: "الازدهار", nameEn: "Al Izdihar", direction: "east" },
      { name: "الروابي", nameEn: "Al Rawabi", direction: "east" },
      { name: "الخليج", nameEn: "Al Khaleej", direction: "east" },
      { name: "اليرموك", nameEn: "Al Yarmuk", direction: "east" },
      { name: "الفيحاء", nameEn: "Al Fayha", direction: "east" },
      { name: "النسيم", nameEn: "Al Naseem", direction: "east" },
      { name: "الريان", nameEn: "Al Rayyan", direction: "east" },
      { name: "جرير", nameEn: "Jarir", direction: "east" },
      { name: "الضباط", nameEn: "Al Dubbat", direction: "east" },
      { name: "المصانع", nameEn: "Al Masani", direction: "east" },
      { name: "الصناعية", nameEn: "Al Sinaiyah", direction: "east" },
      { name: "السلي", nameEn: "Al Slay", direction: "east" },
      // غرب الرياض
      { name: "الشميسي", nameEn: "Al Shemesy", direction: "west" },
      { name: "عرقة", nameEn: "Irqah", direction: "west" },
      { name: "الخزامى", nameEn: "Al Khuzama", direction: "west" },
      { name: "طويق", nameEn: "Tuwaiq", direction: "west" },
      { name: "ظهرة لبن", nameEn: "Dhahrat Laban", direction: "west" },
      { name: "نمار", nameEn: "Namar", direction: "west" },
      { name: "الحزم", nameEn: "Al Hazm", direction: "west" },
      { name: "المهدية", nameEn: "Al Mahdiyah", direction: "west" },
      { name: "السويدي", nameEn: "Al Suwaidi", direction: "west" },
      { name: "الوشام", nameEn: "Al Wisham", direction: "west" },
      // جنوب الرياض
      { name: "الدار البيضاء", nameEn: "Al Dar Al Bayda", direction: "south" },
      { name: "بدر", nameEn: "Badr", direction: "south" },
      { name: "الشفا", nameEn: "Al Shifa", direction: "south" },
      { name: "العزيزية", nameEn: "Al Aziziyah", direction: "south" },
      { name: "الدريهمية", nameEn: "Al Durayhimiyah", direction: "south" },
      { name: "المنفوحة", nameEn: "Al Manfuha", direction: "south" },
      { name: "الفاخرية", nameEn: "Al Fakhriyah", direction: "south" },
      { name: "العود", nameEn: "Al Oud" },
      { name: "الفوطة", nameEn: "Al Fawta" },
      { name: "منفوحة الجديدة", nameEn: "Manfuha Al Jadida" },
    ]
  },
  {
    name: "الخرج",
    nameEn: "Al Kharj",
    region: "منطقة الرياض",
    coordinates: { lat: 24.1500, lng: 47.3000 },
    neighborhoods: [
      { name: "الخزامى", nameEn: "Al Khuzama" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "المنتزه", nameEn: "Al Muntazah" },
      { name: "السيح", nameEn: "Al Sayh" },
      { name: "الدلم", nameEn: "Al Dilam" },
      { name: "اليمامة", nameEn: "Al Yamamah" },
      { name: "الهدا", nameEn: "Al Hada" },
      { name: "المريكبات", nameEn: "Al Murikaybat" },
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
    ]
  },
  {
    name: "الدرعية",
    nameEn: "Diriyah",
    region: "منطقة الرياض",
    coordinates: { lat: 24.7344, lng: 46.5772 },
    neighborhoods: [
      { name: "الطريف", nameEn: "Al Turaif" },
      { name: "البجيري", nameEn: "Al Bujairi" },
      { name: "سمحان", nameEn: "Samhan" },
      { name: "غصيبة", nameEn: "Ghusaybah" },
      { name: "العمارية", nameEn: "Al Ammariyah" },
      { name: "الرفيعة", nameEn: "Al Rafiah" },
      { name: "العودة", nameEn: "Al Awda" },
      { name: "الجبيلة", nameEn: "Al Jubaylah" },
    ]
  },
  {
    name: "الدوادمي",
    nameEn: "Dawadmi",
    region: "منطقة الرياض",
    coordinates: { lat: 24.5000, lng: 44.3833 },
    neighborhoods: [
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "الصفراء", nameEn: "Al Safra" },
      { name: "الشفاء", nameEn: "Al Shifa" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
    ]
  },
  {
    name: "المجمعة",
    nameEn: "Al Majma'ah",
    region: "منطقة الرياض",
    coordinates: { lat: 25.9000, lng: 45.3500 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "المنتزه", nameEn: "Al Muntazah" },
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
      { name: "الملك فهد", nameEn: "King Fahd" },
    ]
  },
  {
    name: "الأفلاج",
    nameEn: "Al Aflaj",
    region: "منطقة الرياض",
    coordinates: { lat: 22.2833, lng: 46.7333 },
    neighborhoods: [
      { name: "ليلى", nameEn: "Layla" },
      { name: "الهدار", nameEn: "Al Hadar" },
      { name: "البديع", nameEn: "Al Badi" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "وادي الدواسر",
    nameEn: "Wadi Al Dawasir",
    region: "منطقة الرياض",
    coordinates: { lat: 20.4833, lng: 44.7667 },
    neighborhoods: [
      { name: "الخماسين", nameEn: "Al Khamasin" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
    ]
  },
  {
    name: "الزلفي",
    nameEn: "Zulfi",
    region: "منطقة الرياض",
    coordinates: { lat: 26.3000, lng: 44.8000 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
    ]
  },
  {
    name: "حوطة بني تميم",
    nameEn: "Hotat Bani Tamim",
    region: "منطقة الرياض",
    coordinates: { lat: 23.5000, lng: 46.8333 },
    neighborhoods: [
      { name: "المركز", nameEn: "Al Markaz" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الورود", nameEn: "Al Wurud" },
    ]
  },
  {
    name: "شقراء",
    nameEn: "Shaqra",
    region: "منطقة الرياض",
    coordinates: { lat: 25.2333, lng: 45.2500 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الورود", nameEn: "Al Wurud" },
    ]
  },

  // ==================== منطقة مكة المكرمة ====================
  {
    name: "جدة",
    nameEn: "Jeddah",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 21.4858, lng: 39.1925 },
    neighborhoods: [
      // شمال جدة
      { name: "أبحر الشمالية", nameEn: "Abhur North", direction: "north" },
      { name: "أبحر الجنوبية", nameEn: "Abhur South", direction: "north" },
      { name: "المرجان", nameEn: "Al Murjan", direction: "north" },
      { name: "الشاطئ", nameEn: "Al Shati", direction: "north" },
      { name: "ذهبان", nameEn: "Dhahban", direction: "north" },
      { name: "الحمدانية", nameEn: "Al Hamdaniyah", direction: "north" },
      { name: "طيبة", nameEn: "Taybah", direction: "north" },
      { name: "المرسلات", nameEn: "Al Mursalat", direction: "north" },
      { name: "الجوهرة", nameEn: "Al Jawhara", direction: "north" },
      { name: "الصواري", nameEn: "Al Sawari", direction: "north" },
      // وسط جدة
      { name: "الحمراء", nameEn: "Al Hamra", direction: "center" },
      { name: "الروضة", nameEn: "Al Rawdah", direction: "center" },
      { name: "الزهراء", nameEn: "Al Zahra", direction: "center" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah", direction: "center" },
      { name: "السلامة", nameEn: "Al Salamah", direction: "center" },
      { name: "الأندلس", nameEn: "Al Andalus", direction: "center" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah", direction: "center" },
      { name: "النعيم", nameEn: "Al Naeem", direction: "center" },
      { name: "الصفا", nameEn: "Al Safa", direction: "center" },
      { name: "النزهة", nameEn: "Al Nuzha", direction: "center" },
      { name: "الربوة", nameEn: "Al Rabwa", direction: "center" },
      { name: "الخالدية", nameEn: "Al Khalidiyah", direction: "center" },
      { name: "الورود", nameEn: "Al Wurud", direction: "center" },
      { name: "البلد", nameEn: "Al Balad", direction: "center" },
      { name: "الكندرة", nameEn: "Al Kandara", direction: "center" },
      { name: "الشرفية", nameEn: "Al Sharafiyah", direction: "center" },
      // شرق جدة
      { name: "البوادي", nameEn: "Al Bawadi", direction: "east" },
      { name: "السامر", nameEn: "Al Samer", direction: "east" },
      { name: "الفروسية", nameEn: "Al Furusiyah", direction: "east" },
      { name: "الريان", nameEn: "Al Rayyan", direction: "east" },
      { name: "بني مالك", nameEn: "Bani Malik", direction: "east" },
      { name: "النهضة", nameEn: "Al Nahda", direction: "east" },
      { name: "مشرفة", nameEn: "Mushrifa", direction: "east" },
      { name: "الفضل", nameEn: "Al Fadl", direction: "east" },
      { name: "الكوثر", nameEn: "Al Kawthar", direction: "east" },
      { name: "الجامعة", nameEn: "Al Jamiah", direction: "east" },
      // جنوب جدة
      { name: "الثغر", nameEn: "Al Thaghr", direction: "south" },
      { name: "العزيزية", nameEn: "Al Aziziyah", direction: "south" },
      { name: "السنابل", nameEn: "Al Sanabel", direction: "south" },
      { name: "المروة", nameEn: "Al Marwa", direction: "south" },
      { name: "الواحة", nameEn: "Al Waha", direction: "south" },
      { name: "المنار", nameEn: "Al Manar", direction: "south" },
      { name: "الشراع", nameEn: "Al Shira", direction: "south" },
      { name: "البساتين", nameEn: "Al Basatin", direction: "south" },
      { name: "الفلاح", nameEn: "Al Falah", direction: "south" },
      { name: "الصالحية", nameEn: "Al Salihiyah", direction: "south" },
      { name: "الهنداوية", nameEn: "Al Hindawiyah", direction: "south" },
      { name: "البغدادية", nameEn: "Al Baghdadiyah", direction: "south" },
      { name: "العمارية", nameEn: "Al Ammariyah", direction: "south" },
      { name: "السبيل", nameEn: "Al Sabil", direction: "south" },
      { name: "الرويس", nameEn: "Al Ruwais", direction: "south" },
      { name: "القريات", nameEn: "Al Qurayyat", direction: "south" },
      { name: "الأجواد", nameEn: "Al Ajwad", direction: "south" },
      { name: "الشراطين", nameEn: "Al Sharatin", direction: "south" },
      { name: "الثعالبة", nameEn: "Al Thaaliba", direction: "south" },
    ]
  },
  {
    name: "مكة المكرمة",
    nameEn: "Makkah",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 21.4225, lng: 39.8262 },
    neighborhoods: [
      // شمال مكة
      { name: "التنعيم", nameEn: "Al Taneem", direction: "north" },
      { name: "العتيبية", nameEn: "Al Utaybiyah", direction: "north" },
      { name: "الشوقية", nameEn: "Al Shawqiyah", direction: "north" },
      { name: "الحمراء", nameEn: "Al Hamra", direction: "north" },
      { name: "جبل النور", nameEn: "Jabal Al Nur", direction: "north" },
      // وسط مكة
      { name: "الحرم", nameEn: "Al Haram", direction: "center" },
      { name: "أجياد", nameEn: "Ajyad", direction: "center" },
      { name: "الحجون", nameEn: "Al Hajun", direction: "center" },
      { name: "المسفلة", nameEn: "Al Misfalah", direction: "center" },
      { name: "جرول", nameEn: "Jarwal", direction: "center" },
      { name: "الغزة", nameEn: "Al Ghazzah", direction: "center" },
      { name: "المعبد", nameEn: "Al Maabad", direction: "center" },
      // شرق مكة
      { name: "العزيزية", nameEn: "Al Aziziyah", direction: "east" },
      { name: "النسيم", nameEn: "Al Naseem", direction: "east" },
      { name: "الرصيفة", nameEn: "Al Rusayfah", direction: "east" },
      { name: "الزاهر", nameEn: "Al Zahir", direction: "east" },
      { name: "المعابدة", nameEn: "Al Maabdah", direction: "east" },
      { name: "المعيصم", nameEn: "Al Muaysim", direction: "east" },
      { name: "بطحاء قريش", nameEn: "Batha Quraish", direction: "east" },
      // غرب مكة
      { name: "الششة", nameEn: "Al Shishah", direction: "west" },
      { name: "الكعكية", nameEn: "Al Kakiyah", direction: "west" },
      { name: "جرهم", nameEn: "Jurham", direction: "west" },
      { name: "العمرة", nameEn: "Al Umrah", direction: "west" },
      { name: "وادي جليل", nameEn: "Wadi Jalil", direction: "west" },
      // جنوب مكة
      { name: "الهجرة", nameEn: "Al Hijra", direction: "south" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah", direction: "south" },
      { name: "الراشدية", nameEn: "Al Rashidiyah", direction: "south" },
      { name: "السلامة", nameEn: "Al Salamah", direction: "south" },
      { name: "الطندباوي", nameEn: "Al Tandabawi", direction: "south" },
      { name: "الخضراء", nameEn: "Al Khadra", direction: "south" },
    ]
  },
  {
    name: "الطائف",
    nameEn: "Taif",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 21.2703, lng: 40.4158 },
    neighborhoods: [
      // شمال الطائف
      { name: "الحوية", nameEn: "Al Hawiyah", direction: "north" },
      { name: "الريان", nameEn: "Al Rayyan", direction: "north" },
      { name: "النسيم", nameEn: "Al Naseem", direction: "north" },
      { name: "الربوة", nameEn: "Al Rabwa", direction: "north" },
      // وسط الطائف
      { name: "الفيصلية", nameEn: "Al Faisaliyah", direction: "center" },
      { name: "السلامة", nameEn: "Al Salamah", direction: "center" },
      { name: "الخالدية", nameEn: "Al Khalidiyah", direction: "center" },
      { name: "المثناة", nameEn: "Al Mathnah", direction: "center" },
      { name: "السلطانية", nameEn: "Al Sultaniyah", direction: "center" },
      // شرق الطائف
      { name: "الشرقية", nameEn: "Al Sharqiyah", direction: "east" },
      { name: "الشهداء", nameEn: "Al Shuhada", direction: "east" },
      { name: "البيعة", nameEn: "Al Bayah", direction: "east" },
      { name: "قروى", nameEn: "Qarwa", direction: "east" },
      // غرب الطائف
      { name: "الهدا", nameEn: "Al Hada", direction: "west" },
      { name: "الشفا", nameEn: "Al Shafa", direction: "west" },
      { name: "العقيق", nameEn: "Al Aqiq", direction: "west" },
      // جنوب الطائف
      { name: "السداد", nameEn: "Al Sidad", direction: "south" },
      { name: "أم العراد", nameEn: "Um Al Irad", direction: "south" },
      { name: "الجال", nameEn: "Al Jal", direction: "south" },
      { name: "القمرية", nameEn: "Al Qamariyah", direction: "south" },
    ]
  },
  {
    name: "القنفذة",
    nameEn: "Al Qunfudhah",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 19.1300, lng: 41.0800 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الكورنيش", nameEn: "Al Corniche" },
      { name: "الصفا", nameEn: "Al Safa" },
      { name: "المروة", nameEn: "Al Marwa" },
    ]
  },
  {
    name: "رابغ",
    nameEn: "Rabigh",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 22.8000, lng: 39.0333 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
    ]
  },
  {
    name: "الليث",
    nameEn: "Al Lith",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 20.1500, lng: 40.2667 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الشاطئ", nameEn: "Al Shati" },
    ]
  },

  // ==================== المنطقة الشرقية ====================
  {
    name: "الدمام",
    nameEn: "Dammam",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.4207, lng: 50.0888 },
    neighborhoods: [
      // شمال الدمام
      { name: "الفيصلية", nameEn: "Al Faisaliyah", direction: "north" },
      { name: "الفرسان", nameEn: "Al Fursan", direction: "north" },
      { name: "الندى", nameEn: "Al Nada", direction: "north" },
      { name: "النزهة", nameEn: "Al Nuzha", direction: "north" },
      { name: "طيبة", nameEn: "Taybah", direction: "north" },
      { name: "أحد", nameEn: "Uhud", direction: "north" },
      // وسط الدمام
      { name: "الشاطئ", nameEn: "Al Shati", direction: "center" },
      { name: "الروضة", nameEn: "Al Rawdah", direction: "center" },
      { name: "النور", nameEn: "Al Nur", direction: "center" },
      { name: "الخليج", nameEn: "Al Khaleej", direction: "center" },
      { name: "السوق", nameEn: "Al Souq", direction: "center" },
      { name: "الدانة", nameEn: "Al Danah", direction: "center" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah", direction: "center" },
      // شرق الدمام
      { name: "الريان", nameEn: "Al Rayyan", direction: "east" },
      { name: "الجلوية", nameEn: "Al Jalawiyah", direction: "east" },
      { name: "المزروعية", nameEn: "Al Mazruiyah", direction: "east" },
      { name: "الأنوار", nameEn: "Al Anwar", direction: "east" },
      { name: "البادية", nameEn: "Al Badiyah", direction: "east" },
      { name: "المريكبات", nameEn: "Al Murikaybat", direction: "east" },
      { name: "الأثير", nameEn: "Al Atheer", direction: "east" },
      // غرب الدمام
      { name: "الضباب", nameEn: "Al Dabab", direction: "west" },
      { name: "النخيل", nameEn: "Al Nakheel", direction: "west" },
      { name: "العزيزية", nameEn: "Al Aziziyah", direction: "west" },
      { name: "الإسكان", nameEn: "Al Iskan", direction: "west" },
      { name: "الهدا", nameEn: "Al Hada", direction: "west" },
      // جنوب الدمام
      { name: "الناصرية", nameEn: "Al Nasiriyah", direction: "south" },
      { name: "البحيرة", nameEn: "Al Buhayrah", direction: "south" },
      { name: "الصفا", nameEn: "Al Safa", direction: "south" },
      { name: "الجامعيين", nameEn: "Al Jamiyin", direction: "south" },
    ]
  },
  {
    name: "الخبر",
    nameEn: "Al Khobar",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.2172, lng: 50.1971 },
    neighborhoods: [
      // شمال الخبر
      { name: "الراكة الشمالية", nameEn: "Al Rakah North", direction: "north" },
      { name: "الخبر الشمالية", nameEn: "Al Khobar North", direction: "north" },
      { name: "اللؤلؤ", nameEn: "Al Lulu", direction: "north" },
      { name: "العقربية", nameEn: "Al Aqrabiyah", direction: "north" },
      { name: "الحزام الأخضر", nameEn: "Green Belt", direction: "north" },
      { name: "الأندلس", nameEn: "Al Andalus", direction: "north" },
      { name: "قرطبة", nameEn: "Qurtuba", direction: "north" },
      // وسط الخبر
      { name: "الكورنيش", nameEn: "Al Corniche", direction: "center" },
      { name: "الحمراء", nameEn: "Al Hamra", direction: "center" },
      { name: "العليا", nameEn: "Al Olaya", direction: "center" },
      { name: "التحلية", nameEn: "Al Tahliyah", direction: "center" },
      { name: "الخزامى", nameEn: "Al Khuzama", direction: "center" },
      // غرب الخبر
      { name: "الهدا", nameEn: "Al Hada", direction: "west" },
      { name: "الروابي", nameEn: "Al Rawabi", direction: "west" },
      { name: "اليرموك", nameEn: "Al Yarmuk", direction: "west" },
      { name: "الجسر", nameEn: "Al Jisr", direction: "west" },
      { name: "الثقبة", nameEn: "Al Thuqbah", direction: "west" },
      // جنوب الخبر
      { name: "الراكة الجنوبية", nameEn: "Al Rakah South", direction: "south" },
      { name: "الخبر الجنوبية", nameEn: "Al Khobar South", direction: "south" },
      { name: "البندرية", nameEn: "Al Bandariyah", direction: "south" },
    ]
  },
  {
    name: "الظهران",
    nameEn: "Dhahran",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.2361, lng: 50.0393 },
    neighborhoods: [
      { name: "الدانة", nameEn: "Al Danah" },
      { name: "الدوحة", nameEn: "Al Doha" },
      { name: "الجامعة", nameEn: "Al Jamiah" },
      { name: "النور", nameEn: "Al Nur" },
      { name: "القصور", nameEn: "Al Qusur" },
      { name: "الفردوس", nameEn: "Al Firdaws" },
      { name: "التحلية", nameEn: "Al Tahliyah" },
      { name: "الإسكان", nameEn: "Al Iskan" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
    ]
  },
  {
    name: "الأحساء",
    nameEn: "Al Ahsa",
    region: "المنطقة الشرقية",
    coordinates: { lat: 25.3833, lng: 49.5833 },
    neighborhoods: [
      // شمال الأحساء
      { name: "المبرز", nameEn: "Al Mubarraz", direction: "north" },
      { name: "المطار", nameEn: "Al Matar", direction: "north" },
      { name: "العمران", nameEn: "Al Omran", direction: "north" },
      { name: "الجفر", nameEn: "Al Jafr", direction: "north" },
      // وسط الأحساء
      { name: "الهفوف", nameEn: "Al Hofuf", direction: "center" },
      { name: "الخالدية", nameEn: "Al Khalidiyah", direction: "center" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah", direction: "center" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah", direction: "center" },
      { name: "الروضة", nameEn: "Al Rawdah", direction: "center" },
      { name: "النزهة", nameEn: "Al Nuzha", direction: "center" },
      // شرق الأحساء
      { name: "العيون", nameEn: "Al Oyun", direction: "east" },
      { name: "الجشة", nameEn: "Al Jasha", direction: "east" },
      { name: "القارة", nameEn: "Al Qarah", direction: "east" },
      { name: "الطرف", nameEn: "Al Taraf", direction: "east" },
      // غرب الأحساء
      { name: "الصالحية", nameEn: "Al Salihiyah", direction: "west" },
      { name: "الرفعة", nameEn: "Al Rifah", direction: "west" },
      // جنوب الأحساء
      { name: "الرقيقة", nameEn: "Al Raqiqah", direction: "south" },
      { name: "الشعبة", nameEn: "Al Shubah", direction: "south" },
      { name: "البطالية", nameEn: "Al Bataliyah", direction: "south" },
      { name: "الحليلة", nameEn: "Al Hulaylah", direction: "south" },
    ]
  },
  {
    name: "القطيف",
    nameEn: "Qatif",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.5196, lng: 50.0115 },
    neighborhoods: [
      { name: "تاروت", nameEn: "Tarut" },
      { name: "سيهات", nameEn: "Saihat" },
      { name: "صفوى", nameEn: "Safwa" },
      { name: "العوامية", nameEn: "Al Awamiyah" },
      { name: "الجش", nameEn: "Al Jish" },
      { name: "أم الحمام", nameEn: "Um Al Hammam" },
      { name: "الجارودية", nameEn: "Al Jarudiyah" },
      { name: "الخويلدية", nameEn: "Al Khuwaylidiyah" },
      { name: "الأوجام", nameEn: "Al Awjam" },
      { name: "الملاحة", nameEn: "Al Malaha" },
      { name: "الربيعية", nameEn: "Al Rabiiyah" },
      { name: "الدبيبية", nameEn: "Al Dubabiyah" },
      { name: "الشويكة", nameEn: "Al Shwaykah" },
      { name: "القديح", nameEn: "Al Qudaih" },
      { name: "حلة محيش", nameEn: "Hilla Muhaysh" },
    ]
  },
  {
    name: "الجبيل",
    nameEn: "Jubail",
    region: "المنطقة الشرقية",
    coordinates: { lat: 27.0046, lng: 49.6225 },
    neighborhoods: [
      { name: "الفناتير", nameEn: "Al Fanateer" },
      { name: "الحويلات", nameEn: "Al Huwaylat" },
      { name: "الدفي", nameEn: "Al Dafi" },
      { name: "الفيحاء", nameEn: "Al Fayha" },
      { name: "المدينة الصناعية", nameEn: "Industrial City" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "الجوهرة", nameEn: "Al Jawhara" },
      { name: "البلد", nameEn: "Al Balad" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "المرجان", nameEn: "Al Murjan" },
      { name: "اللؤلؤ", nameEn: "Al Lulu" },
      { name: "الياقوت", nameEn: "Al Yaqut" },
      { name: "الفردوس", nameEn: "Al Firdaws" },
      { name: "القدس", nameEn: "Al Quds" },
    ]
  },
  {
    name: "رأس تنورة",
    nameEn: "Ras Tanura",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.6500, lng: 50.1667 },
    neighborhoods: [
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الفاخرية", nameEn: "Al Fakhriyah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "المرجان", nameEn: "Al Murjan" },
    ]
  },
  {
    name: "حفر الباطن",
    nameEn: "Hafar Al Batin",
    region: "المنطقة الشرقية",
    coordinates: { lat: 28.4328, lng: 45.9708 },
    neighborhoods: [
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "الصفاء", nameEn: "Al Safa" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "الربوة", nameEn: "Al Rabwa" },
    ]
  },
  {
    name: "بقيق",
    nameEn: "Buqayq",
    region: "المنطقة الشرقية",
    coordinates: { lat: 25.9333, lng: 49.6667 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
    ]
  },
  {
    name: "الخفجي",
    nameEn: "Khafji",
    region: "المنطقة الشرقية",
    coordinates: { lat: 28.4167, lng: 48.5000 },
    neighborhoods: [
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الشاطئ", nameEn: "Al Shati" },
    ]
  },
  {
    name: "النعيرية",
    nameEn: "Nairyah",
    region: "المنطقة الشرقية",
    coordinates: { lat: 27.4667, lng: 48.4833 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
    ]
  },

  // ==================== منطقة المدينة المنورة ====================
  {
    name: "المدينة المنورة",
    nameEn: "Madinah",
    region: "منطقة المدينة المنورة",
    coordinates: { lat: 24.5247, lng: 39.5692 },
    neighborhoods: [
      // شمال المدينة
      { name: "الملك فهد", nameEn: "King Fahd", direction: "north" },
      { name: "الاسكان", nameEn: "Al Iskan", direction: "north" },
      { name: "طيبة", nameEn: "Taybah", direction: "north" },
      { name: "العزيزية", nameEn: "Al Aziziyah", direction: "north" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah", direction: "north" },
      { name: "المطار", nameEn: "Al Matar", direction: "north" },
      // وسط المدينة
      { name: "الحرم", nameEn: "Al Haram", direction: "center" },
      { name: "المناخة", nameEn: "Al Manakhah", direction: "center" },
      { name: "الروضة", nameEn: "Al Rawdah", direction: "center" },
      { name: "سكة الحديد", nameEn: "Sikkat Al Hadid", direction: "center" },
      { name: "البحر", nameEn: "Al Bahr", direction: "center" },
      // شرق المدينة
      { name: "الحرة الشرقية", nameEn: "Al Harra Al Sharqiyah", direction: "east" },
      { name: "المصانع", nameEn: "Al Masani", direction: "east" },
      { name: "العنابس", nameEn: "Al Anabis", direction: "east" },
      { name: "الدفاع", nameEn: "Al Difa", direction: "east" },
      { name: "الجماوات", nameEn: "Al Jamawat", direction: "east" },
      // غرب المدينة
      { name: "شوران", nameEn: "Shoran", direction: "west" },
      { name: "السيح", nameEn: "Al Sayh", direction: "west" },
      { name: "المغيسلة", nameEn: "Al Mughaysilah", direction: "west" },
      { name: "العريض", nameEn: "Al Uryd", direction: "west" },
      { name: "نبلاء", nameEn: "Nubala", direction: "west" },
      // جنوب المدينة
      { name: "قباء", nameEn: "Quba", direction: "south" },
      { name: "قربان", nameEn: "Qurban", direction: "south" },
      { name: "الجمعة", nameEn: "Al Jumuah", direction: "south" },
      { name: "العوالي", nameEn: "Al Awali", direction: "south" },
      { name: "الشريبات", nameEn: "Al Shuraybat", direction: "south" },
      { name: "الرانوناء", nameEn: "Al Ranuna", direction: "south" },
      { name: "بني حارثة", nameEn: "Bani Harithah", direction: "south" },
      { name: "السلام", nameEn: "Al Salam", direction: "south" },
    ]
  },
  {
    name: "ينبع",
    nameEn: "Yanbu",
    region: "منطقة المدينة المنورة",
    coordinates: { lat: 24.0883, lng: 38.0583 },
    neighborhoods: [
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "البلد", nameEn: "Al Balad" },
      { name: "المطار", nameEn: "Al Matar" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الكورنيش", nameEn: "Al Corniche" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "المروة", nameEn: "Al Marwa" },
      { name: "الصفا", nameEn: "Al Safa" },
      { name: "الدانة", nameEn: "Al Danah" },
      { name: "الجوهرة", nameEn: "Al Jawhara" },
    ]
  },
  {
    name: "العلا",
    nameEn: "Al Ula",
    region: "منطقة المدينة المنورة",
    coordinates: { lat: 26.6175, lng: 37.9178 },
    neighborhoods: [
      { name: "البلد القديم", nameEn: "Old Town" },
      { name: "المغيرة", nameEn: "Al Mughayra" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الجديدة", nameEn: "Al Jadida" },
    ]
  },

  // ==================== منطقة القصيم ====================
  {
    name: "بريدة",
    nameEn: "Buraydah",
    region: "منطقة القصيم",
    coordinates: { lat: 26.3260, lng: 43.9750 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "النقع", nameEn: "Al Naqa" },
      { name: "الصفراء", nameEn: "Al Safra" },
      { name: "سلطانة", nameEn: "Sultanah" },
      { name: "المنتزه", nameEn: "Al Muntazah" },
      { name: "الخليج", nameEn: "Al Khaleej" },
      { name: "الإسكان", nameEn: "Al Iskan" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "القادسية", nameEn: "Al Qadisiyah" },
      { name: "الحمر", nameEn: "Al Hamr" },
      { name: "الرفيعة", nameEn: "Al Rafiah" },
      { name: "البكيرية", nameEn: "Al Bukayriyah" },
      { name: "العليا", nameEn: "Al Olaya" },
      { name: "الأسياح", nameEn: "Al Asyah" },
    ]
  },
  {
    name: "عنيزة",
    nameEn: "Unaizah",
    region: "منطقة القصيم",
    coordinates: { lat: 26.0844, lng: 43.9936 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الملك فهد", nameEn: "King Fahd" },
      { name: "الجناح", nameEn: "Al Janah" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "المنتزه", nameEn: "Al Muntazah" },
      { name: "الورود", nameEn: "Al Wurud" },
    ]
  },
  {
    name: "الرس",
    nameEn: "Ar Rass",
    region: "منطقة القصيم",
    coordinates: { lat: 25.8667, lng: 43.5000 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الورود", nameEn: "Al Wurud" },
    ]
  },
  {
    name: "المذنب",
    nameEn: "Al Mithnab",
    region: "منطقة القصيم",
    coordinates: { lat: 25.8500, lng: 44.2167 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "البكيرية",
    nameEn: "Al Bukayriyah",
    region: "منطقة القصيم",
    coordinates: { lat: 26.1333, lng: 43.6500 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },

  // ==================== منطقة عسير ====================
  {
    name: "أبها",
    nameEn: "Abha",
    region: "منطقة عسير",
    coordinates: { lat: 18.2164, lng: 42.5053 },
    neighborhoods: [
      { name: "المفتاحة", nameEn: "Al Miftaha" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "المنسك", nameEn: "Al Mansak" },
      { name: "الموظفين", nameEn: "Al Muwadhafin" },
      { name: "شمسان", nameEn: "Shamsan" },
      { name: "القابل", nameEn: "Al Qabil" },
      { name: "السودة", nameEn: "Al Sawda" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "البديع", nameEn: "Al Badi" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "ذهبان", nameEn: "Dhahban" },
      { name: "المروج", nameEn: "Al Muruj" },
      { name: "النسيم", nameEn: "Al Naseem" },
      { name: "الوسام", nameEn: "Al Wisam" },
    ]
  },
  {
    name: "خميس مشيط",
    nameEn: "Khamis Mushait",
    region: "منطقة عسير",
    coordinates: { lat: 18.3000, lng: 42.7333 },
    neighborhoods: [
      { name: "الراكة", nameEn: "Al Rakah" },
      { name: "الموسى", nameEn: "Al Musa" },
      { name: "الحزام", nameEn: "Al Hizam" },
      { name: "النسيم", nameEn: "Al Naseem" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "المحالة", nameEn: "Al Mahalah" },
      { name: "الضباب", nameEn: "Al Dabab" },
      { name: "الوسام", nameEn: "Al Wisam" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الشرفية", nameEn: "Al Sharafiyah" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "درب الشعر", nameEn: "Darb Al Shaar" },
    ]
  },
  {
    name: "بيشة",
    nameEn: "Bisha",
    region: "منطقة عسير",
    coordinates: { lat: 19.9833, lng: 42.6000 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "الورود", nameEn: "Al Wurud" },
    ]
  },
  {
    name: "النماص",
    nameEn: "Al Namas",
    region: "منطقة عسير",
    coordinates: { lat: 19.1167, lng: 42.1333 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "محايل عسير",
    nameEn: "Muhayil Asir",
    region: "منطقة عسير",
    coordinates: { lat: 18.5500, lng: 42.0500 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
    ]
  },

  // ==================== منطقة تبوك ====================
  {
    name: "تبوك",
    nameEn: "Tabuk",
    region: "منطقة تبوك",
    coordinates: { lat: 28.3838, lng: 36.5550 },
    neighborhoods: [
      { name: "المروج", nameEn: "Al Muruj" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "المصيف", nameEn: "Al Masif" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "القادسية", nameEn: "Al Qadisiyah" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "الحمراء", nameEn: "Al Hamra" },
      { name: "السليمانية", nameEn: "Al Sulaymaniyah" },
      { name: "الملك فهد", nameEn: "King Fahd" },
      { name: "الأندلس", nameEn: "Al Andalus" },
    ]
  },
  {
    name: "ضباء",
    nameEn: "Duba",
    region: "منطقة تبوك",
    coordinates: { lat: 27.3500, lng: 35.6833 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "الوجه",
    nameEn: "Al Wajh",
    region: "منطقة تبوك",
    coordinates: { lat: 26.2333, lng: 36.4667 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "أملج",
    nameEn: "Umluj",
    region: "منطقة تبوك",
    coordinates: { lat: 25.0500, lng: 37.2667 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
    ]
  },
  {
    name: "حقل",
    nameEn: "Haql",
    region: "منطقة تبوك",
    coordinates: { lat: 29.2833, lng: 34.9333 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
    ]
  },

  // ==================== منطقة حائل ====================
  {
    name: "حائل",
    nameEn: "Hail",
    region: "منطقة حائل",
    coordinates: { lat: 27.5114, lng: 41.7208 },
    neighborhoods: [
      { name: "المحطة", nameEn: "Al Mahattah" },
      { name: "الخزامى", nameEn: "Al Khuzama" },
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
      { name: "المنتزه", nameEn: "Al Muntazah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "النقرة", nameEn: "Al Naqrah" },
      { name: "لبدة", nameEn: "Lubda" },
      { name: "الزهراء", nameEn: "Al Zahra" },
      { name: "البادية", nameEn: "Al Badiyah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "الملك عبدالله", nameEn: "King Abdullah" },
    ]
  },
  {
    name: "بقعاء",
    nameEn: "Baqaa",
    region: "منطقة حائل",
    coordinates: { lat: 27.9000, lng: 42.3833 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },

  // ==================== منطقة نجران ====================
  {
    name: "نجران",
    nameEn: "Najran",
    region: "منطقة نجران",
    coordinates: { lat: 17.4917, lng: 44.1322 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الفهد", nameEn: "Al Fahd" },
      { name: "أبا السعود", nameEn: "Aba Al Saud" },
      { name: "المشيرفة", nameEn: "Al Mushayrifah" },
      { name: "الضباب", nameEn: "Al Dabab" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "الشرفية", nameEn: "Al Sharafiyah" },
      { name: "المنتزه", nameEn: "Al Muntazah" },
    ]
  },
  {
    name: "شرورة",
    nameEn: "Sharurah",
    region: "منطقة نجران",
    coordinates: { lat: 17.4833, lng: 47.1167 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },

  // ==================== منطقة جازان ====================
  {
    name: "جازان",
    nameEn: "Jazan",
    region: "منطقة جازان",
    coordinates: { lat: 16.8892, lng: 42.5511 },
    neighborhoods: [
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "المطار", nameEn: "Al Matar" },
      { name: "السويس", nameEn: "Al Suways" },
      { name: "الصفا", nameEn: "Al Safa" },
      { name: "المرجان", nameEn: "Al Murjan" },
      { name: "الجوهرة", nameEn: "Al Jawhara" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
    ]
  },
  {
    name: "صبيا",
    nameEn: "Sabya",
    region: "منطقة جازان",
    coordinates: { lat: 17.1500, lng: 42.6167 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
    ]
  },
  {
    name: "أبو عريش",
    nameEn: "Abu Arish",
    region: "منطقة جازان",
    coordinates: { lat: 16.9667, lng: 42.8333 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "صامطة",
    nameEn: "Samtah",
    region: "منطقة جازان",
    coordinates: { lat: 16.6000, lng: 43.1000 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "فرسان",
    nameEn: "Farasan",
    region: "منطقة جازان",
    coordinates: { lat: 16.7000, lng: 42.1167 },
    neighborhoods: [
      { name: "المركز", nameEn: "Al Markaz" },
      { name: "الساحل", nameEn: "Al Sahil" },
      { name: "الروضة", nameEn: "Al Rawdah" },
    ]
  },

  // ==================== منطقة الباحة ====================
  {
    name: "الباحة",
    nameEn: "Al Bahah",
    region: "منطقة الباحة",
    coordinates: { lat: 20.0125, lng: 41.4653 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الزهراء", nameEn: "Al Zahra" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "المنتزه", nameEn: "Al Muntazah" },
      { name: "الملك فهد", nameEn: "King Fahd" },
    ]
  },
  {
    name: "بلجرشي",
    nameEn: "Baljurashi",
    region: "منطقة الباحة",
    coordinates: { lat: 19.8667, lng: 41.5667 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "المندق",
    nameEn: "Al Mandaq",
    region: "منطقة الباحة",
    coordinates: { lat: 20.1833, lng: 41.2833 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
    ]
  },

  // ==================== منطقة الجوف ====================
  {
    name: "سكاكا",
    nameEn: "Sakaka",
    region: "منطقة الجوف",
    coordinates: { lat: 29.9697, lng: 40.2064 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "الراكة", nameEn: "Al Rakah" },
      { name: "الشلهوب", nameEn: "Al Shulhub" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "الصالحية", nameEn: "Al Salihiyah" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
    ]
  },
  {
    name: "دومة الجندل",
    nameEn: "Dumat Al Jandal",
    region: "منطقة الجوف",
    coordinates: { lat: 29.8167, lng: 39.8667 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "البلد القديم", nameEn: "Old Town" },
    ]
  },
  {
    name: "القريات",
    nameEn: "Al Qurayyat",
    region: "منطقة الجوف",
    coordinates: { lat: 31.3333, lng: 37.3500 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
    ]
  },

  // ==================== منطقة الحدود الشمالية ====================
  {
    name: "عرعر",
    nameEn: "Arar",
    region: "منطقة الحدود الشمالية",
    coordinates: { lat: 30.9753, lng: 41.0381 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الملك عبدالعزيز", nameEn: "King Abdulaziz" },
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الورود", nameEn: "Al Wurud" },
    ]
  },
  {
    name: "رفحاء",
    nameEn: "Rafha",
    region: "منطقة الحدود الشمالية",
    coordinates: { lat: 29.6333, lng: 43.4833 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
  {
    name: "طريف",
    nameEn: "Turaif",
    region: "منطقة الحدود الشمالية",
    coordinates: { lat: 31.6667, lng: 38.6500 },
    neighborhoods: [
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلام", nameEn: "Al Salam" },
    ]
  },
];

// Export utility functions
export function getCityByName(name: string): City | undefined {
  return saudiCities.find(city => city.name === name || city.nameEn.toLowerCase() === name.toLowerCase());
}

export function getCitiesByRegion(region: string): City[] {
  return saudiCities.filter(city => city.region === region);
}

export function getNeighborhoodsByCity(cityName: string): Neighborhood[] {
  const city = getCityByName(cityName);
  return city ? city.neighborhoods : [];
}

export function getAllRegions(): string[] {
  const regions = saudiCities.map(city => city.region);
  return regions.filter((region, index) => regions.indexOf(region) === index);
}

export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase();
  return saudiCities.filter(city => 
    city.name.includes(query) || 
    city.nameEn.toLowerCase().includes(lowerQuery)
  );
}

export function searchNeighborhoods(query: string): { city: City; neighborhood: Neighborhood }[] {
  const results: { city: City; neighborhood: Neighborhood }[] = [];
  const lowerQuery = query.toLowerCase();
  
  saudiCities.forEach(city => {
    city.neighborhoods.forEach(neighborhood => {
      if (neighborhood.name.includes(query) || 
          (neighborhood.nameEn && neighborhood.nameEn.toLowerCase().includes(lowerQuery))) {
        results.push({ city, neighborhood });
      }
    });
  });
  
  return results;
}

export function findCityInText(text: string): { city: string; coordinates: Coordinates } | null {
  if (!text) return null;
  
  for (const city of saudiCities) {
    if (text.includes(city.name) || text.toLowerCase().includes(city.nameEn.toLowerCase())) {
      return {
        city: city.name,
        coordinates: city.coordinates
      };
    }
  }
  
  return null;
}

export function getCityNames(): string[] {
  return saudiCities.map(city => city.name);
}
