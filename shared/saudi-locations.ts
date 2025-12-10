// Comprehensive Saudi Arabia Cities and Neighborhoods Database
// المدن والأحياء في المملكة العربية السعودية

export interface Neighborhood {
  name: string;
  nameEn?: string;
}

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
      { name: "النرجس", nameEn: "Al Narjis" },
      { name: "الياسمين", nameEn: "Al Yasmin" },
      { name: "الملقا", nameEn: "Al Malqa" },
      { name: "حطين", nameEn: "Hittin" },
      { name: "الصحافة", nameEn: "Al Sahafa" },
      { name: "الغدير", nameEn: "Al Ghadeer" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "العقيق", nameEn: "Al Aqiq" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "السليمانية", nameEn: "Al Sulaymaniyah" },
      { name: "المروج", nameEn: "Al Muruj" },
      { name: "الرحمانية", nameEn: "Al Rahmaniyah" },
      { name: "الربيع", nameEn: "Al Rabie" },
      { name: "القيروان", nameEn: "Al Qairawan" },
      { name: "العارض", nameEn: "Al Arid" },
      { name: "الصفا", nameEn: "Al Safa" },
      { name: "الحمراء", nameEn: "Al Hamra" },
      { name: "المصيف", nameEn: "Al Masif" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "السفارات", nameEn: "Al Safarat" },
      { name: "الشهداء", nameEn: "Al Shuhada" },
      { name: "النموذجية", nameEn: "Al Namudhajiya" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "المنصورة", nameEn: "Al Mansoura" },
      { name: "الملز", nameEn: "Al Malaz" },
      { name: "العليا", nameEn: "Al Olaya" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "المربع", nameEn: "Al Murabba" },
      { name: "الديرة", nameEn: "Al Dirah" },
      { name: "البطحاء", nameEn: "Al Batha" },
      { name: "الشميسي", nameEn: "Al Shemesy" },
      { name: "عرقة", nameEn: "Irqah" },
      { name: "الخزامى", nameEn: "Al Khuzama" },
      { name: "طويق", nameEn: "Tuwaiq" },
      { name: "ظهرة لبن", nameEn: "Dhahrat Laban" },
      { name: "نمار", nameEn: "Namar" },
      { name: "الدار البيضاء", nameEn: "Al Dar Al Bayda" },
      { name: "المونسية", nameEn: "Al Munsiyah" },
      { name: "قرطبة", nameEn: "Qurtuba" },
      { name: "الندى", nameEn: "Al Nada" },
      { name: "الوادي", nameEn: "Al Wadi" },
      { name: "الازدهار", nameEn: "Al Izdihar" },
      { name: "المعذر", nameEn: "Al Mathar" },
      { name: "الفلاح", nameEn: "Al Falah" },
      { name: "الروابي", nameEn: "Al Rawabi" },
      { name: "الخليج", nameEn: "Al Khaleej" },
      { name: "اليرموك", nameEn: "Al Yarmuk" },
      { name: "الحزم", nameEn: "Al Hazm" },
      { name: "المهدية", nameEn: "Al Mahdiyah" },
      { name: "بدر", nameEn: "Badr" },
      { name: "الشفا", nameEn: "Al Shifa" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "الدريهمية", nameEn: "Al Durayhimiyah" },
      { name: "السويدي", nameEn: "Al Suwaidi" },
      { name: "الوشام", nameEn: "Al Wisham" },
      { name: "المنفوحة", nameEn: "Al Manfuha" },
      { name: "الفيحاء", nameEn: "Al Fayha" },
      { name: "النسيم", nameEn: "Al Naseem" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "جرير", nameEn: "Jarir" },
      { name: "الضباط", nameEn: "Al Dubbat" },
      { name: "المصانع", nameEn: "Al Masani" },
      { name: "الصناعية", nameEn: "Al Sinaiyah" },
      { name: "السلي", nameEn: "Al Slay" },
      { name: "الفاخرية", nameEn: "Al Fakhriyah" },
      { name: "أم الحمام", nameEn: "Um Al Hammam" },
      { name: "الشعلان", nameEn: "Al Shalaan" },
      { name: "الضباب", nameEn: "Al Dabab" },
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
      { name: "الحمراء", nameEn: "Al Hamra" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الزهراء", nameEn: "Al Zahra" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السلامة", nameEn: "Al Salamah" },
      { name: "الأندلس", nameEn: "Al Andalus" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "النعيم", nameEn: "Al Naeem" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "أبحر الشمالية", nameEn: "Abhur North" },
      { name: "أبحر الجنوبية", nameEn: "Abhur South" },
      { name: "الصفا", nameEn: "Al Safa" },
      { name: "المرجان", nameEn: "Al Murjan" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "البوادي", nameEn: "Al Bawadi" },
      { name: "السامر", nameEn: "Al Samer" },
      { name: "الفروسية", nameEn: "Al Furusiyah" },
      { name: "الأجواد", nameEn: "Al Ajwad" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "بني مالك", nameEn: "Bani Malik" },
      { name: "الثغر", nameEn: "Al Thaghr" },
      { name: "البلد", nameEn: "Al Balad" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "السنابل", nameEn: "Al Sanabel" },
      { name: "المروة", nameEn: "Al Marwa" },
      { name: "الواحة", nameEn: "Al Waha" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "المنار", nameEn: "Al Manar" },
      { name: "الجوهرة", nameEn: "Al Jawhara" },
      { name: "الشراع", nameEn: "Al Shira" },
      { name: "البساتين", nameEn: "Al Basatin" },
      { name: "الفضل", nameEn: "Al Fadl" },
      { name: "الكوثر", nameEn: "Al Kawthar" },
      { name: "الصواري", nameEn: "Al Sawari" },
      { name: "الفلاح", nameEn: "Al Falah" },
      { name: "الصالحية", nameEn: "Al Salihiyah" },
      { name: "مشرفة", nameEn: "Mushrifa" },
      { name: "الكندرة", nameEn: "Al Kandara" },
      { name: "الشرفية", nameEn: "Al Sharafiyah" },
      { name: "الهنداوية", nameEn: "Al Hindawiyah" },
      { name: "البغدادية", nameEn: "Al Baghdadiyah" },
      { name: "العمارية", nameEn: "Al Ammariyah" },
      { name: "السبيل", nameEn: "Al Sabil" },
      { name: "الرويس", nameEn: "Al Ruwais" },
      { name: "القريات", nameEn: "Al Qurayyat" },
      { name: "الجامعة", nameEn: "Al Jamiah" },
      { name: "المرسلات", nameEn: "Al Mursalat" },
      { name: "ذهبان", nameEn: "Dhahban" },
      { name: "طيبة", nameEn: "Taybah" },
      { name: "الشراطين", nameEn: "Al Sharatin" },
      { name: "الحمدانية", nameEn: "Al Hamdaniyah" },
      { name: "الثعالبة", nameEn: "Al Thaaliba" },
    ]
  },
  {
    name: "مكة المكرمة",
    nameEn: "Makkah",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 21.4225, lng: 39.8262 },
    neighborhoods: [
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "الشوقية", nameEn: "Al Shawqiyah" },
      { name: "النسيم", nameEn: "Al Naseem" },
      { name: "الرصيفة", nameEn: "Al Rusayfah" },
      { name: "الزاهر", nameEn: "Al Zahir" },
      { name: "الحمراء", nameEn: "Al Hamra" },
      { name: "الششة", nameEn: "Al Shishah" },
      { name: "الكعكية", nameEn: "Al Kakiyah" },
      { name: "المسفلة", nameEn: "Al Misfalah" },
      { name: "جرهم", nameEn: "Jurham" },
      { name: "الهجرة", nameEn: "Al Hijra" },
      { name: "التنعيم", nameEn: "Al Taneem" },
      { name: "العتيبية", nameEn: "Al Utaybiyah" },
      { name: "المعابدة", nameEn: "Al Maabdah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الراشدية", nameEn: "Al Rashidiyah" },
      { name: "الحجون", nameEn: "Al Hajun" },
      { name: "المعيصم", nameEn: "Al Muaysim" },
      { name: "السلامة", nameEn: "Al Salamah" },
      { name: "بطحاء قريش", nameEn: "Batha Quraish" },
      { name: "جبل النور", nameEn: "Jabal Al Nur" },
      { name: "العمرة", nameEn: "Al Umrah" },
      { name: "الطندباوي", nameEn: "Al Tandabawi" },
      { name: "الخضراء", nameEn: "Al Khadra" },
      { name: "وادي جليل", nameEn: "Wadi Jalil" },
      { name: "الحرم", nameEn: "Al Haram" },
      { name: "أجياد", nameEn: "Ajyad" },
      { name: "جرول", nameEn: "Jarwal" },
      { name: "الغزة", nameEn: "Al Ghazzah" },
      { name: "المعبد", nameEn: "Al Maabad" },
    ]
  },
  {
    name: "الطائف",
    nameEn: "Taif",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 21.2703, lng: 40.4158 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الشهداء", nameEn: "Al Shuhada" },
      { name: "السلامة", nameEn: "Al Salamah" },
      { name: "الحوية", nameEn: "Al Hawiyah" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "النسيم", nameEn: "Al Naseem" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "المثناة", nameEn: "Al Mathnah" },
      { name: "قروى", nameEn: "Qarwa" },
      { name: "السداد", nameEn: "Al Sidad" },
      { name: "أم العراد", nameEn: "Um Al Irad" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "الجال", nameEn: "Al Jal" },
      { name: "السلطانية", nameEn: "Al Sultaniyah" },
      { name: "الشرقية", nameEn: "Al Sharqiyah" },
      { name: "البيعة", nameEn: "Al Bayah" },
      { name: "الهدا", nameEn: "Al Hada" },
      { name: "الشفا", nameEn: "Al Shafa" },
      { name: "العقيق", nameEn: "Al Aqiq" },
      { name: "القمرية", nameEn: "Al Qamariyah" },
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
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "الفرسان", nameEn: "Al Fursan" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الجلوية", nameEn: "Al Jalawiyah" },
      { name: "المزروعية", nameEn: "Al Mazruiyah" },
      { name: "الأنوار", nameEn: "Al Anwar" },
      { name: "النور", nameEn: "Al Nur" },
      { name: "الضباب", nameEn: "Al Dabab" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "البادية", nameEn: "Al Badiyah" },
      { name: "المريكبات", nameEn: "Al Murikaybat" },
      { name: "الخليج", nameEn: "Al Khaleej" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "الناصرية", nameEn: "Al Nasiriyah" },
      { name: "الندى", nameEn: "Al Nada" },
      { name: "السوق", nameEn: "Al Souq" },
      { name: "الأثير", nameEn: "Al Atheer" },
      { name: "الدانة", nameEn: "Al Danah" },
      { name: "الإسكان", nameEn: "Al Iskan" },
      { name: "البحيرة", nameEn: "Al Buhayrah" },
      { name: "أحد", nameEn: "Uhud" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "الصفا", nameEn: "Al Safa" },
      { name: "الهدا", nameEn: "Al Hada" },
      { name: "طيبة", nameEn: "Taybah" },
      { name: "الجامعيين", nameEn: "Al Jamiyin" },
    ]
  },
  {
    name: "الخبر",
    nameEn: "Al Khobar",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.2172, lng: 50.1971 },
    neighborhoods: [
      { name: "الراكة الشمالية", nameEn: "Al Rakah North" },
      { name: "الراكة الجنوبية", nameEn: "Al Rakah South" },
      { name: "اللؤلؤ", nameEn: "Al Lulu" },
      { name: "العقربية", nameEn: "Al Aqrabiyah" },
      { name: "الخبر الشمالية", nameEn: "Al Khobar North" },
      { name: "الخبر الجنوبية", nameEn: "Al Khobar South" },
      { name: "الثقبة", nameEn: "Al Thuqbah" },
      { name: "البندرية", nameEn: "Al Bandariyah" },
      { name: "الحزام الأخضر", nameEn: "Green Belt" },
      { name: "الحمراء", nameEn: "Al Hamra" },
      { name: "الكورنيش", nameEn: "Al Corniche" },
      { name: "الهدا", nameEn: "Al Hada" },
      { name: "التحلية", nameEn: "Al Tahliyah" },
      { name: "الجسر", nameEn: "Al Jisr" },
      { name: "الروابي", nameEn: "Al Rawabi" },
      { name: "اليرموك", nameEn: "Al Yarmuk" },
      { name: "الخزامى", nameEn: "Al Khuzama" },
      { name: "الأندلس", nameEn: "Al Andalus" },
      { name: "العليا", nameEn: "Al Olaya" },
      { name: "قرطبة", nameEn: "Qurtuba" },
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
      { name: "المبرز", nameEn: "Al Mubarraz" },
      { name: "الهفوف", nameEn: "Al Hofuf" },
      { name: "العيون", nameEn: "Al Oyun" },
      { name: "الجفر", nameEn: "Al Jafr" },
      { name: "المطار", nameEn: "Al Matar" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "الصالحية", nameEn: "Al Salihiyah" },
      { name: "الرفعة", nameEn: "Al Rifah" },
      { name: "الرقيقة", nameEn: "Al Raqiqah" },
      { name: "القارة", nameEn: "Al Qarah" },
      { name: "الشعبة", nameEn: "Al Shubah" },
      { name: "الطرف", nameEn: "Al Taraf" },
      { name: "الجشة", nameEn: "Al Jasha" },
      { name: "العمران", nameEn: "Al Omran" },
      { name: "البطالية", nameEn: "Al Bataliyah" },
      { name: "الحليلة", nameEn: "Al Hulaylah" },
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
      { name: "قباء", nameEn: "Quba" },
      { name: "العنابس", nameEn: "Al Anabis" },
      { name: "المصانع", nameEn: "Al Masani" },
      { name: "الحرة الشرقية", nameEn: "Al Harra Al Sharqiyah" },
      { name: "الدفاع", nameEn: "Al Difa" },
      { name: "سكة الحديد", nameEn: "Sikkat Al Hadid" },
      { name: "قربان", nameEn: "Qurban" },
      { name: "الاسكان", nameEn: "Al Iskan" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "طيبة", nameEn: "Taybah" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الجمعة", nameEn: "Al Jumuah" },
      { name: "العوالي", nameEn: "Al Awali" },
      { name: "البحر", nameEn: "Al Bahr" },
      { name: "الشريبات", nameEn: "Al Shuraybat" },
      { name: "الرانوناء", nameEn: "Al Ranuna" },
      { name: "شوران", nameEn: "Shoran" },
      { name: "بني حارثة", nameEn: "Bani Harithah" },
      { name: "المناخة", nameEn: "Al Manakhah" },
      { name: "الحرم", nameEn: "Al Haram" },
      { name: "السيح", nameEn: "Al Sayh" },
      { name: "الجماوات", nameEn: "Al Jamawat" },
      { name: "المطار", nameEn: "Al Matar" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "المغيسلة", nameEn: "Al Mughaysilah" },
      { name: "العريض", nameEn: "Al Uryd" },
      { name: "الملك فهد", nameEn: "King Fahd" },
      { name: "نبلاء", nameEn: "Nubala" },
      { name: "السلام", nameEn: "Al Salam" },
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
