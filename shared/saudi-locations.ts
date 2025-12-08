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
  // الرياض - Riyadh
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
    ]
  },
  // جدة - Jeddah
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
      { name: "اللؤلؤ", nameEn: "Al Lulu" },
      { name: "ذهبان", nameEn: "Dhahban" },
      { name: "طيبة", nameEn: "Taiba" },
    ]
  },
  // مكة المكرمة - Makkah
  {
    name: "مكة المكرمة",
    nameEn: "Makkah",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 21.3891, lng: 39.8579 },
    neighborhoods: [
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "الشوقية", nameEn: "Al Shawqiyah" },
      { name: "النسيم", nameEn: "Al Naseem" },
      { name: "الرصيفة", nameEn: "Al Rusayfah" },
      { name: "الزاهر", nameEn: "Al Zahir" },
      { name: "الحجون", nameEn: "Al Hajun" },
      { name: "المسفلة", nameEn: "Al Misfalah" },
      { name: "جرول", nameEn: "Jarwal" },
      { name: "الهجرة", nameEn: "Al Hijra" },
      { name: "الشرائع", nameEn: "Al Sharai" },
      { name: "العوالي", nameEn: "Al Awali" },
      { name: "الكعكية", nameEn: "Al Kakiyah" },
      { name: "الششة", nameEn: "Al Shisha" },
      { name: "بطحاء قريش", nameEn: "Batha Quraish" },
      { name: "العتيبية", nameEn: "Al Utaybiyah" },
      { name: "الطندباوي", nameEn: "Al Tandabawi" },
      { name: "ريع ذاخر", nameEn: "Rai Dhakhir" },
      { name: "الجميزة", nameEn: "Al Jumayzah" },
      { name: "المعابدة", nameEn: "Al Maabida" },
      { name: "الراشدية", nameEn: "Al Rashidiyah" },
    ]
  },
  // المدينة المنورة - Madinah
  {
    name: "المدينة المنورة",
    nameEn: "Madinah",
    region: "منطقة المدينة المنورة",
    coordinates: { lat: 24.5247, lng: 39.5692 },
    neighborhoods: [
      { name: "الحرم", nameEn: "Al Haram" },
      { name: "قباء", nameEn: "Quba" },
      { name: "العوالي", nameEn: "Al Awali" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الملك فهد", nameEn: "King Fahd" },
      { name: "العنبرية", nameEn: "Al Anbariyah" },
      { name: "الجرف", nameEn: "Al Jurf" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "النصر", nameEn: "Al Nasr" },
      { name: "الدار", nameEn: "Al Dar" },
      { name: "الشهداء", nameEn: "Al Shuhada" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "الإسكان", nameEn: "Al Iskan" },
      { name: "المبعوث", nameEn: "Al Mabuth" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "الدفاع", nameEn: "Al Difaa" },
      { name: "السد", nameEn: "Al Sad" },
      { name: "أحد", nameEn: "Uhud" },
      { name: "العريض", nameEn: "Al Areed" },
    ]
  },
  // الدمام - Dammam
  {
    name: "الدمام",
    nameEn: "Dammam",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.4207, lng: 50.0888 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "المزروعية", nameEn: "Al Mazruiyah" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "الفرسان", nameEn: "Al Fursan" },
      { name: "الجلوية", nameEn: "Al Jalawiyah" },
      { name: "البادية", nameEn: "Al Badiyah" },
      { name: "الأثير", nameEn: "Al Atheer" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "الضباب", nameEn: "Al Dabab" },
      { name: "الدانة", nameEn: "Al Dana" },
      { name: "المنار", nameEn: "Al Manar" },
      { name: "الجامعيين", nameEn: "Al Jamiyeen" },
      { name: "غرناطة", nameEn: "Gharnata" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الحمراء", nameEn: "Al Hamra" },
      { name: "طيبة", nameEn: "Taiba" },
      { name: "الواحة", nameEn: "Al Waha" },
      { name: "الندى", nameEn: "Al Nada" },
      { name: "الطبيشي", nameEn: "Al Tabishi" },
      { name: "البحيرة", nameEn: "Al Buhairah" },
      { name: "العدامة", nameEn: "Al Adamah" },
      { name: "العنود", nameEn: "Al Anoud" },
    ]
  },
  // الخبر - Al Khobar
  {
    name: "الخبر",
    nameEn: "Al Khobar",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.2172, lng: 50.1971 },
    neighborhoods: [
      { name: "الكورنيش", nameEn: "Corniche" },
      { name: "اللؤلؤ", nameEn: "Al Lulu" },
      { name: "الحزام الذهبي", nameEn: "Golden Belt" },
      { name: "الراكة", nameEn: "Al Rakah" },
      { name: "الثقبة", nameEn: "Al Thuqbah" },
      { name: "العليا", nameEn: "Al Olaya" },
      { name: "الخزامى", nameEn: "Al Khuzama" },
      { name: "الحزام الأخضر", nameEn: "Green Belt" },
      { name: "البندرية", nameEn: "Al Bandariyah" },
      { name: "العقربية", nameEn: "Al Aqrabiyah" },
      { name: "الجسر", nameEn: "Al Jisr" },
      { name: "التحلية", nameEn: "Al Tahliya" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "اليرموك", nameEn: "Al Yarmuk" },
      { name: "الصفا", nameEn: "Al Safa" },
      { name: "الهدا", nameEn: "Al Hada" },
      { name: "المدينة الرياضية", nameEn: "Sports City" },
      { name: "الحمراء", nameEn: "Al Hamra" },
      { name: "السفن", nameEn: "Al Sufun" },
      { name: "قرطبة", nameEn: "Qurtuba" },
    ]
  },
  // الظهران - Dhahran
  {
    name: "الظهران",
    nameEn: "Dhahran",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.2361, lng: 50.0393 },
    neighborhoods: [
      { name: "الدوحة الشمالية", nameEn: "North Doha" },
      { name: "الدوحة الجنوبية", nameEn: "South Doha" },
      { name: "مدينة الملك فهد الجامعية", nameEn: "KFUPM" },
      { name: "الظهران الجديدة", nameEn: "New Dhahran" },
      { name: "أرامكو السعودية", nameEn: "Saudi Aramco" },
    ]
  },
  // الأحساء - Al Ahsa
  {
    name: "الأحساء",
    nameEn: "Al Ahsa",
    region: "المنطقة الشرقية",
    coordinates: { lat: 25.3833, lng: 49.5833 },
    neighborhoods: [
      { name: "الهفوف", nameEn: "Al Hofuf" },
      { name: "المبرز", nameEn: "Al Mubarraz" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الصالحية", nameEn: "Al Salihiyah" },
      { name: "المنصورة", nameEn: "Al Mansoura" },
      { name: "الرقيقة", nameEn: "Al Raqiqa" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "النعاثل", nameEn: "Al Naathil" },
      { name: "البصيرة", nameEn: "Al Basira" },
      { name: "المزروع", nameEn: "Al Mazrou" },
      { name: "العيون", nameEn: "Al Oyoun" },
      { name: "الجفر", nameEn: "Al Jafr" },
      { name: "القرين", nameEn: "Al Qrain" },
      { name: "الشعبة", nameEn: "Al Shaaba" },
      { name: "العمران", nameEn: "Al Omran" },
    ]
  },
  // القطيف - Qatif
  {
    name: "القطيف",
    nameEn: "Qatif",
    region: "المنطقة الشرقية",
    coordinates: { lat: 26.5196, lng: 50.0115 },
    neighborhoods: [
      { name: "القلعة", nameEn: "Al Qala" },
      { name: "الجارودية", nameEn: "Al Jarudiyah" },
      { name: "صفوى", nameEn: "Safwa" },
      { name: "سيهات", nameEn: "Saihat" },
      { name: "عنك", nameEn: "Anak" },
      { name: "تاروت", nameEn: "Tarout" },
      { name: "الأوجام", nameEn: "Al Awjam" },
      { name: "الخويلدية", nameEn: "Al Khuwaylidiyah" },
      { name: "أم الحمام", nameEn: "Umm Al Hamam" },
      { name: "الربيعية", nameEn: "Al Rubaiyah" },
    ]
  },
  // الطائف - Taif
  {
    name: "الطائف",
    nameEn: "Taif",
    region: "منطقة مكة المكرمة",
    coordinates: { lat: 21.2703, lng: 40.4158 },
    neighborhoods: [
      { name: "الحوية", nameEn: "Al Hawiyah" },
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الشهداء", nameEn: "Al Shuhada" },
      { name: "السلامة", nameEn: "Al Salamah" },
      { name: "الحلقة", nameEn: "Al Halqa" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "الهدا", nameEn: "Al Hada" },
      { name: "الشفا", nameEn: "Al Shafa" },
      { name: "نخب", nameEn: "Nakhab" },
      { name: "القمرية", nameEn: "Al Qamariyah" },
      { name: "السداد", nameEn: "Al Sadad" },
      { name: "المثناة", nameEn: "Al Muthnah" },
      { name: "القيم", nameEn: "Al Qim" },
      { name: "أم العراد", nameEn: "Umm Al Arad" },
    ]
  },
  // تبوك - Tabuk
  {
    name: "تبوك",
    nameEn: "Tabuk",
    region: "منطقة تبوك",
    coordinates: { lat: 28.3838, lng: 36.5550 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "السليمانية", nameEn: "Al Sulaymaniyah" },
      { name: "المروج", nameEn: "Al Muruj" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "المصيف", nameEn: "Al Masif" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "البوادي", nameEn: "Al Bawadi" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "أم سرار", nameEn: "Umm Sarar" },
      { name: "الصفاء", nameEn: "Al Safa" },
      { name: "المروة", nameEn: "Al Marwa" },
      { name: "النخيل", nameEn: "Al Nakheel" },
    ]
  },
  // أبها - Abha
  {
    name: "أبها",
    nameEn: "Abha",
    region: "منطقة عسير",
    coordinates: { lat: 18.2164, lng: 42.5053 },
    neighborhoods: [
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الضباب", nameEn: "Al Dabab" },
      { name: "المفتاحة", nameEn: "Al Muftaha" },
      { name: "النسيم", nameEn: "Al Naseem" },
      { name: "المروج", nameEn: "Al Muruj" },
      { name: "الوردتين", nameEn: "Al Wardatain" },
      { name: "شمسان", nameEn: "Shamsan" },
      { name: "الربوة", nameEn: "Al Rabwa" },
      { name: "البديع", nameEn: "Al Badi" },
      { name: "المنسك", nameEn: "Al Mansak" },
      { name: "الموظفين", nameEn: "Al Muwazafeen" },
      { name: "السد", nameEn: "Al Sad" },
      { name: "القرى", nameEn: "Al Qura" },
      { name: "الجميعة", nameEn: "Al Jamia" },
      { name: "السودة", nameEn: "Al Soudah" },
    ]
  },
  // خميس مشيط - Khamis Mushait
  {
    name: "خميس مشيط",
    nameEn: "Khamis Mushait",
    region: "منطقة عسير",
    coordinates: { lat: 18.3060, lng: 42.7294 },
    neighborhoods: [
      { name: "الراقي", nameEn: "Al Raqi" },
      { name: "الموسى", nameEn: "Al Mousa" },
      { name: "الحضارية", nameEn: "Al Hadariyah" },
      { name: "درب البر", nameEn: "Darb Al Bir" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الجرف", nameEn: "Al Jurf" },
      { name: "النسيم", nameEn: "Al Naseem" },
      { name: "الواحة", nameEn: "Al Waha" },
      { name: "التحلية", nameEn: "Al Tahliya" },
      { name: "الشرفية", nameEn: "Al Sharafiyah" },
      { name: "الأمير سلطان", nameEn: "Prince Sultan" },
      { name: "المطار", nameEn: "Al Matar" },
      { name: "أحد رفيدة", nameEn: "Ahad Rufaidah" },
    ]
  },
  // بريدة - Buraydah
  {
    name: "بريدة",
    nameEn: "Buraydah",
    region: "منطقة القصيم",
    coordinates: { lat: 26.3260, lng: 43.9750 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الخليج", nameEn: "Al Khaleej" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "النقع", nameEn: "Al Naqa" },
      { name: "السالمية", nameEn: "Al Salmiyah" },
      { name: "الصفراء", nameEn: "Al Safra" },
      { name: "الإسكان", nameEn: "Al Iskan" },
      { name: "الحمر", nameEn: "Al Hamr" },
      { name: "البصيرية", nameEn: "Al Busairiyah" },
      { name: "الربيعية", nameEn: "Al Rubaiyah" },
      { name: "هجرة المحيرقة", nameEn: "Hijrat Al Muhayriqa" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "الوادي", nameEn: "Al Wadi" },
      { name: "الجردة", nameEn: "Al Jardah" },
      { name: "الشماس", nameEn: "Al Shimas" },
    ]
  },
  // عنيزة - Unayzah
  {
    name: "عنيزة",
    nameEn: "Unayzah",
    region: "منطقة القصيم",
    coordinates: { lat: 26.0840, lng: 43.9939 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "السلام", nameEn: "Al Salam" },
      { name: "الريان", nameEn: "Al Rayyan" },
      { name: "المروج", nameEn: "Al Muruj" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "الروابي", nameEn: "Al Rawabi" },
      { name: "الجوهرة", nameEn: "Al Jawhara" },
      { name: "الصفاء", nameEn: "Al Safa" },
    ]
  },
  // حائل - Hail
  {
    name: "حائل",
    nameEn: "Hail",
    region: "منطقة حائل",
    coordinates: { lat: 27.5114, lng: 41.7208 },
    neighborhoods: [
      { name: "المصيف", nameEn: "Al Masif" },
      { name: "الخزامى", nameEn: "Al Khuzama" },
      { name: "السمراء", nameEn: "Al Samra" },
      { name: "النقرة", nameEn: "Al Nuqra" },
      { name: "الصفراء", nameEn: "Al Safra" },
      { name: "العزيزية", nameEn: "Al Aziziyah" },
      { name: "المنتزه", nameEn: "Al Muntazah" },
      { name: "البادية", nameEn: "Al Badiyah" },
      { name: "القاعد", nameEn: "Al Qaid" },
      { name: "الوسيطاء", nameEn: "Al Wasita" },
      { name: "لبده", nameEn: "Labdah" },
      { name: "الجامعيين", nameEn: "Al Jamiyeen" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "المحطة", nameEn: "Al Mahatta" },
    ]
  },
  // نجران - Najran
  {
    name: "نجران",
    nameEn: "Najran",
    region: "منطقة نجران",
    coordinates: { lat: 17.4924, lng: 44.1277 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الفهد", nameEn: "Al Fahd" },
      { name: "المخيم", nameEn: "Al Mukhayyam" },
      { name: "الضباب", nameEn: "Al Dabab" },
      { name: "أبا السعود", nameEn: "Aba Al Saud" },
      { name: "الشرفة", nameEn: "Al Shurfa" },
      { name: "العريسة", nameEn: "Al Uraisa" },
      { name: "الجربة", nameEn: "Al Jarba" },
      { name: "المنصورة", nameEn: "Al Mansoura" },
      { name: "شرورة", nameEn: "Sharurah" },
    ]
  },
  // جازان - Jazan
  {
    name: "جازان",
    nameEn: "Jazan",
    region: "منطقة جازان",
    coordinates: { lat: 16.8892, lng: 42.5511 },
    neighborhoods: [
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "الشاطئ", nameEn: "Al Shati" },
      { name: "المطار", nameEn: "Al Matar" },
      { name: "السويس", nameEn: "Al Suways" },
      { name: "الصفا", nameEn: "Al Safa" },
      { name: "المنطقة الصناعية", nameEn: "Industrial Area" },
      { name: "صبيا", nameEn: "Sabya" },
      { name: "أبو عريش", nameEn: "Abu Arish" },
      { name: "الدرب", nameEn: "Al Darb" },
      { name: "فرسان", nameEn: "Farasan" },
    ]
  },
  // الجبيل - Jubail
  {
    name: "الجبيل",
    nameEn: "Jubail",
    region: "المنطقة الشرقية",
    coordinates: { lat: 27.0046, lng: 49.6225 },
    neighborhoods: [
      { name: "الفناتير", nameEn: "Al Fanatir" },
      { name: "الحويلات", nameEn: "Al Huwailat" },
      { name: "الدفي", nameEn: "Al Dafi" },
      { name: "الجبيل الصناعية", nameEn: "Jubail Industrial" },
      { name: "الحزام الأخضر", nameEn: "Green Belt" },
      { name: "الفيحاء", nameEn: "Al Fayha" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "الجوهرة", nameEn: "Al Jawhara" },
      { name: "قصر الملك", nameEn: "Qasr Al Malik" },
      { name: "المدينة الصناعية", nameEn: "Industrial City" },
    ]
  },
  // ينبع - Yanbu
  {
    name: "ينبع",
    nameEn: "Yanbu",
    region: "منطقة المدينة المنورة",
    coordinates: { lat: 24.0895, lng: 38.0618 },
    neighborhoods: [
      { name: "ينبع الصناعية", nameEn: "Yanbu Industrial" },
      { name: "ينبع البحر", nameEn: "Yanbu Al Bahr" },
      { name: "الشرم", nameEn: "Al Sharm" },
      { name: "الهيئة الملكية", nameEn: "Royal Commission" },
      { name: "النخيل", nameEn: "Al Nakheel" },
      { name: "السويق", nameEn: "Al Suwaiq" },
      { name: "الجابرية", nameEn: "Al Jabriyah" },
      { name: "الرضوى", nameEn: "Al Radwa" },
      { name: "البلد", nameEn: "Al Balad" },
      { name: "الصناعية", nameEn: "Industrial" },
    ]
  },
  // الباحة - Al Baha
  {
    name: "الباحة",
    nameEn: "Al Baha",
    region: "منطقة الباحة",
    coordinates: { lat: 20.0129, lng: 41.4677 },
    neighborhoods: [
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "الحزام", nameEn: "Al Hizam" },
      { name: "الزرقاء", nameEn: "Al Zarqa" },
      { name: "النزهة", nameEn: "Al Nuzha" },
      { name: "العقيق", nameEn: "Al Aqiq" },
      { name: "بلجرشي", nameEn: "Baljurashi" },
      { name: "المندق", nameEn: "Al Mandaq" },
      { name: "القرى", nameEn: "Al Qura" },
      { name: "المظيلف", nameEn: "Al Muzaylif" },
      { name: "الروضة", nameEn: "Al Rawdah" },
    ]
  },
  // سكاكا - Sakaka
  {
    name: "سكاكا",
    nameEn: "Sakaka",
    region: "منطقة الجوف",
    coordinates: { lat: 29.9697, lng: 40.2064 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "النهضة", nameEn: "Al Nahda" },
      { name: "الصفاء", nameEn: "Al Safa" },
      { name: "الشلال", nameEn: "Al Shalal" },
      { name: "الرحمانية", nameEn: "Al Rahmaniyah" },
      { name: "المروج", nameEn: "Al Muruj" },
      { name: "الزيتون", nameEn: "Al Zaytoun" },
      { name: "دومة الجندل", nameEn: "Dumat Al Jandal" },
      { name: "القريات", nameEn: "Al Qurayyat" },
    ]
  },
  // عرعر - Arar
  {
    name: "عرعر",
    nameEn: "Arar",
    region: "منطقة الحدود الشمالية",
    coordinates: { lat: 30.9753, lng: 41.0066 },
    neighborhoods: [
      { name: "الفيصلية", nameEn: "Al Faisaliyah" },
      { name: "الخالدية", nameEn: "Al Khalidiyah" },
      { name: "المحمدية", nameEn: "Al Muhammadiyah" },
      { name: "المساعدية", nameEn: "Al Musaidiyah" },
      { name: "الجوهرة", nameEn: "Al Jawhara" },
      { name: "الروضة", nameEn: "Al Rawdah" },
      { name: "السليمانية", nameEn: "Al Sulaymaniyah" },
      { name: "الورود", nameEn: "Al Wurud" },
      { name: "رفحاء", nameEn: "Rafha" },
      { name: "طريف", nameEn: "Turaif" },
    ]
  },
];

// Helper functions
export const getCityNames = (): string[] => {
  return saudiCities.map(city => city.name);
};

export const getNeighborhoodsByCity = (cityName: string): string[] => {
  const city = saudiCities.find(c => c.name === cityName);
  return city ? city.neighborhoods.map(n => n.name) : [];
};

export const getCityByName = (cityName: string): City | undefined => {
  return saudiCities.find(c => c.name === cityName);
};

export const searchNeighborhoods = (query: string): { city: string; neighborhood: string }[] => {
  const results: { city: string; neighborhood: string }[] = [];
  
  saudiCities.forEach(city => {
    city.neighborhoods.forEach(neighborhood => {
      if (neighborhood.name.includes(query) || (neighborhood.nameEn && neighborhood.nameEn.toLowerCase().includes(query.toLowerCase()))) {
        results.push({ city: city.name, neighborhood: neighborhood.name });
      }
    });
  });
  
  return results;
};

export const getAllNeighborhoods = (): { city: string; neighborhood: string }[] => {
  const results: { city: string; neighborhood: string }[] = [];
  
  saudiCities.forEach(city => {
    city.neighborhoods.forEach(neighborhood => {
      results.push({ city: city.name, neighborhood: neighborhood.name });
    });
  });
  
  return results;
};

// Get regions
export const getRegions = (): string[] => {
  return Array.from(new Set(saudiCities.map(city => city.region)));
};

// Get cities by region
export const getCitiesByRegion = (regionName: string): City[] => {
  return saudiCities.filter(city => city.region === regionName);
};

// Get city coordinates by name
export const getCityCoordinates = (cityName: string): Coordinates | null => {
  const city = saudiCities.find(c => c.name === cityName || c.nameEn.toLowerCase() === cityName.toLowerCase());
  return city ? city.coordinates : null;
};

// Find city in text and return coordinates
// Also checks for neighborhood names and maps them to their parent city
export const findCityInText = (text: string): { city: string; coordinates: Coordinates } | null => {
  // First try to find exact city name match
  for (const city of saudiCities) {
    if (text.includes(city.name) || text.toLowerCase().includes(city.nameEn.toLowerCase())) {
      return { city: city.name, coordinates: city.coordinates };
    }
  }
  
  // If no city found, try to find a neighborhood and return its parent city
  for (const city of saudiCities) {
    for (const neighborhood of city.neighborhoods) {
      if (text.includes(neighborhood.name)) {
        return { city: city.name, coordinates: city.coordinates };
      }
    }
  }
  
  return null;
};
