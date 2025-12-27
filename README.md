# Bricks - Real Estate Platform

منصة عقارية متكاملة لإدارة الممتلكات والمطابقة بين المشترين والبائعين.

## المتطلبات الأساسية

- **Node.js** 20 أو أحدث
- **PostgreSQL** 16 أو أحدث
- **npm** أو **yarn**

## الإعداد والتشغيل

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد قاعدة البيانات

#### خيار أ: استخدام PostgreSQL محلي

1. تأكد من تثبيت PostgreSQL على جهازك
2. أنشئ قاعدة بيانات جديدة:
   ```bash
   createdb bricks_db
   ```
   أو باستخدام `psql`:
   ```sql
   CREATE DATABASE bricks_db;
   ```

#### خيار ب: استخدام قاعدة بيانات سحابية

استخدم خدمة مثل:
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [Railway](https://railway.app)
- [Render](https://render.com)

### 3. إعداد متغيرات البيئة

1. أنشئ ملف `.env` في مجلد المشروع:
   ```bash
   touch .env
   ```

2. أضف المحتوى التالي إلى ملف `.env` وعدّل رابط قاعدة البيانات:
   ```env
   # Database Configuration
   # Replace with your actual PostgreSQL database URL
   DATABASE_URL=postgresql://user:password@localhost:5432/bricks_db

   # Server Configuration
   PORT=3000

   # Session Secret (for development)
   SESSION_SECRET=tatabuk-dev-secret-key-2024

   # Node Environment
   NODE_ENV=development
   ```

   **مهم**: استبدل `user` و `password` و `bricks_db` بقيم قاعدة البيانات الخاصة بك.

### 4. تشغيل قاعدة البيانات

تأكد من أن PostgreSQL يعمل على جهازك:
```bash
# على macOS
brew services start postgresql@16

# على Linux
sudo systemctl start postgresql

# أو استخدم Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16
```

### 5. تشغيل التطبيق

```bash
npm run dev
```

سيبدأ السيرفر على `http://localhost:3000` (أو البورت المحدد في `.env`)

### 6. الوصول إلى التطبيق

افتح المتصفح وانتقل إلى:
```
http://localhost:3000
```

## حل المشاكل الشائعة

### خطأ: "DATABASE_URL must be set"

- تأكد من وجود ملف `.env` في مجلد المشروع
- تأكد من أن `DATABASE_URL` موجود في ملف `.env`
- تحقق من صحة رابط قاعدة البيانات

### خطأ: "Connection refused" عند الوصول إلى localhost:3000

1. **تحقق من تشغيل السيرفر**:
   ```bash
   npm run dev
   ```
   يجب أن ترى رسالة: `serving on port 3000`

2. **تحقق من البورت**:
   - تأكد من أن البورت 3000 غير مستخدم من قبل تطبيق آخر
   - يمكنك تغيير البورت في ملف `.env`:
     ```env
     PORT=3001
     ```

3. **تحقق من قاعدة البيانات**:
   - تأكد من أن PostgreSQL يعمل
   - تحقق من صحة `DATABASE_URL` في ملف `.env`
   - جرب الاتصال بقاعدة البيانات:
     ```bash
     psql $DATABASE_URL
     ```

### خطأ: "Cannot find module" أو أخطاء في الاستيراد

```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install
```

## الأوامر المتاحة

- `npm run dev` - تشغيل السيرفر في وضع التطوير
- `npm run build` - بناء التطبيق للإنتاج
- `npm run start` - تشغيل التطبيق في وضع الإنتاج
- `npm run check` - فحص الأخطاء في TypeScript
- `npm run db:push` - دفع تغييرات قاعدة البيانات

## البنية

- `client/` - كود الواجهة الأمامية (React + TypeScript)
- `server/` - كود السيرفر (Express + TypeScript)
- `shared/` - الكود المشترك بين الواجهة والسيرفر
- `migrations/` - ملفات هجرة قاعدة البيانات

## المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## الترخيص

MIT

