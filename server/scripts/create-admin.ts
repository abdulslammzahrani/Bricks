import "dotenv/config";
import bcrypt from "bcryptjs";
import { storage } from "../storage";

async function createAdmin() {
  try {
    const adminPhone = "0500000000";
    const adminPassword = "admin123";
    const adminEmail = "admin@bricks.sa";
    const adminName = "مدير النظام";

    // Check if admin already exists
    const existingAdmin = await storage.getUserByPhone(adminPhone);
    
    if (existingAdmin) {
      console.log("✅ مستخدم الأدمن موجود بالفعل:");
      console.log(`   رقم الجوال: ${existingAdmin.phone}`);
      console.log(`   البريد الإلكتروني: ${existingAdmin.email}`);
      console.log(`   الاسم: ${existingAdmin.name}`);
      console.log(`   الدور: ${existingAdmin.role}`);
      console.log("\n📝 بيانات الدخول:");
      console.log(`   رقم الجوال: ${adminPhone}`);
      console.log(`   كلمة المرور: ${adminPassword}`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await storage.createUser({
      email: adminEmail,
      phone: adminPhone,
      name: adminName,
      role: "admin",
      passwordHash,
      requiresPasswordReset: false,
    });

    console.log("✅ تم إنشاء مستخدم الأدمن بنجاح!");
    console.log("\n📝 بيانات الدخول:");
    console.log(`   رقم الجوال: ${adminPhone}`);
    console.log(`   كلمة المرور: ${adminPassword}`);
    console.log(`   البريد الإلكتروني: ${adminEmail}`);
    console.log(`   الاسم: ${adminName}`);
    console.log(`   الدور: ${admin.role}`);
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء مستخدم الأدمن:", error.message);
    process.exit(1);
  }
}

createAdmin().then(() => {
  console.log("\n✨ تم الانتهاء!");
  process.exit(0);
});


