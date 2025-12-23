import { PrismaClient } from '@prisma/client'

// نترك القوسين فارغين تماماً ليعتمد على ملف .env تلقائياً
const prisma = new PrismaClient()

async function main() {
  console.log('⏳ جاري محاولة الاتصال والبحث عن البيانات...')

  try {
    // استخدام الاسم كما هو في schema (buyer_preferences)
    const result = await prisma.buyer_preferences.findMany()

    console.log('✅ تم الاتصال بنجاح!')
    console.log(`📊 وجدنا ${result.length} سجلات في جدول buyer_preferences`)
    console.table(result) // سيعرض البيانات في جدول منسق
  } catch (error) {
    console.error('❌ خطأ في جلب البيانات:', error instanceof Error ? error.message : String(error))
  }
}

main().finally(async () => { await prisma.$disconnect() })