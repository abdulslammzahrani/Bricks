import "dotenv/config";
import { db } from "../db";
import { formConfigs, formSteps, formFields, fieldOptions } from "@shared/schema";
import { SPECIFIC_TAGS, SMART_RANGES, ALL_PROPERTY_TYPES } from "../../client/src/lib/property-form-config";
import { saudiCities } from "@shared/saudi-locations";
import { eq } from "drizzle-orm";

async function migrateFormConfigs() {
  console.log("🚀 بدء ترحيل إعدادات النماذج...");

  try {
    // التحقق من النماذج الموجودة
    const existingConfigs = await db.select().from(formConfigs);
    const existingNames = existingConfigs.map((c) => c.name);

    // 1. إنشاء نموذج المشتري
    let buyerForm;
    if (existingNames.includes("buyer_form")) {
      console.log("📝 نموذج المشتري موجود بالفعل، تخطي...");
      buyerForm = existingConfigs.find((c) => c.name === "buyer_form");
    } else {
      console.log("📝 إنشاء نموذج المشتري...");
      const [newBuyerForm] = await db
        .insert(formConfigs)
        .values({
          name: "buyer_form",
          formType: "buyer",
          displayName: "نموذج المشتري",
          description: "نموذج تسجيل رغبات المشتري",
          isActive: true,
        })
        .returning();
      buyerForm = newBuyerForm;

      // إضافة الخطوات فقط إذا كان النموذج جديداً
      if (buyerForm) {
      // خطوات نموذج المشتري
      const buyerSteps = [
        { title: "المعلومات الشخصية", description: "الاسم والهاتف والبريد", icon: "User", order: 1 },
        { title: "المدينة", description: "اختيار المدينة", icon: "MapPin", order: 2 },
        { title: "الأحياء", description: "اختيار الأحياء المفضلة", icon: "MapPin", order: 3 },
        { title: "نوع العقار", description: "اختيار نوع العقار", icon: "Home", order: 4 },
        { title: "المواصفات", description: "الغرف والمساحة", icon: "Ruler", order: 5 },
        { title: "الميزانية", description: "نطاق الميزانية", icon: "Wallet", order: 6 },
        { title: "طريقة الدفع", description: "كاش أو تمويل", icon: "CreditCard", order: 7 },
        { title: "اللمسات الأخيرة", description: "التاقات الذكية", icon: "Sparkles", order: 8 },
      ];

      for (const stepData of buyerSteps) {
      const [step] = await db
        .insert(formSteps)
        .values({
          formId: buyerForm.id,
          ...stepData,
          isRequired: true,
          isActive: true,
        })
        .returning();

      // إضافة الحقول لكل خطوة
      if (step.title === "المعلومات الشخصية") {
        await db.insert(formFields).values([
          {
            stepId: step.id,
            name: "name",
            label: "الاسم",
            type: "text",
            placeholder: "أدخل اسمك",
            required: true,
            order: 1,
            isActive: true,
          },
          {
            stepId: step.id,
            name: "phone",
            label: "رقم الهاتف",
            type: "text",
            placeholder: "05xxxxxxxx",
            required: true,
            order: 2,
            isActive: true,
          },
          {
            stepId: step.id,
            name: "email",
            label: "البريد الإلكتروني",
            type: "text",
            placeholder: "example@email.com",
            required: false,
            order: 3,
            isActive: true,
          },
        ]);
      } else if (step.title === "المدينة") {
        await db.insert(formFields).values([
          {
            stepId: step.id,
            name: "cities",
            label: "المدينة",
            type: "multi_select",
            placeholder: "اختر المدينة",
            required: true,
            order: 1,
            isActive: true,
          },
        ]);

        const cityField = await db
          .select()
          .from(formFields)
          .where(eq(formFields.stepId, step.id))
          .limit(1);

        if (cityField[0]) {
          // إضافة خيارات المدن
          for (let i = 0; i < saudiCities.length; i++) {
            await db.insert(fieldOptions).values({
              fieldId: cityField[0].id,
              value: saudiCities[i].name,
              label: saudiCities[i].name,
              order: i + 1,
              isActive: true,
            });
          }
        }
      } else if (step.title === "الأحياء") {
        await db.insert(formFields).values([
          {
            stepId: step.id,
            name: "districts",
            label: "الأحياء",
            type: "multi_select",
            placeholder: "اختر الأحياء",
            required: false,
            order: 1,
            isActive: true,
          },
        ]);
      } else if (step.title === "نوع العقار") {
        await db.insert(formFields).values([
          {
            stepId: step.id,
            name: "propertyType",
            label: "نوع العقار",
            type: "select",
            placeholder: "اختر نوع العقار",
            required: true,
            order: 1,
            isActive: true,
          },
        ]);

        const propertyTypeField = await db
          .select()
          .from(formFields)
          .where(eq(formFields.stepId, step.id))
          .limit(1);

        if (propertyTypeField[0]) {
          // إضافة أنواع العقارات
          for (let i = 0; i < ALL_PROPERTY_TYPES.length; i++) {
            const propType = ALL_PROPERTY_TYPES[i];
            await db.insert(fieldOptions).values({
              fieldId: propertyTypeField[0].id,
              value: propType.value,
              label: propType.label,
              icon: propType.icon.name,
              order: i + 1,
              isActive: true,
            });
          }
        }
      } else if (step.title === "المواصفات") {
        await db.insert(formFields).values([
          {
            stepId: step.id,
            name: "rooms",
            label: "عدد الغرف",
            type: "select",
            placeholder: "اختر عدد الغرف",
            required: false,
            order: 1,
            isActive: true,
          },
          {
            stepId: step.id,
            name: "area",
            label: "المساحة",
            type: "select",
            placeholder: "اختر المساحة",
            required: false,
            order: 2,
            isActive: true,
          },
        ]);

        const roomsField = await db
          .select()
          .from(formFields)
          .where(eq(formFields.stepId, step.id))
          .where(eq(formFields.name, "rooms"))
          .limit(1);

        const areaField = await db
          .select()
          .from(formFields)
          .where(eq(formFields.stepId, step.id))
          .where(eq(formFields.name, "area"))
          .limit(1);

        if (roomsField[0]) {
          for (let i = 0; i < SMART_RANGES.rooms.length; i++) {
            await db.insert(fieldOptions).values({
              fieldId: roomsField[0].id,
              value: SMART_RANGES.rooms[i],
              label: SMART_RANGES.rooms[i],
              order: i + 1,
              isActive: true,
            });
          }
        }

        if (areaField[0]) {
          for (let i = 0; i < SMART_RANGES.area.length; i++) {
            await db.insert(fieldOptions).values({
              fieldId: areaField[0].id,
              value: SMART_RANGES.area[i],
              label: SMART_RANGES.area[i],
              order: i + 1,
              isActive: true,
            });
          }
        }
      } else if (step.title === "الميزانية") {
        await db.insert(formFields).values([
          {
            stepId: step.id,
            name: "maxPrice",
            label: "الميزانية",
            type: "range",
            placeholder: "اختر الميزانية",
            required: false,
            order: 1,
            isActive: true,
          },
        ]);
      } else if (step.title === "طريقة الدفع") {
        await db.insert(formFields).values([
          {
            stepId: step.id,
            name: "paymentMethod",
            label: "طريقة الدفع",
            type: "select",
            placeholder: "اختر طريقة الدفع",
            required: false,
            order: 1,
            isActive: true,
          },
        ]);

        const paymentField = await db
          .select()
          .from(formFields)
          .where(eq(formFields.stepId, step.id))
          .limit(1);

        if (paymentField[0]) {
          await db.insert(fieldOptions).values([
            {
              fieldId: paymentField[0].id,
              value: "cash",
              label: "كاش",
              order: 1,
              isActive: true,
            },
            {
              fieldId: paymentField[0].id,
              value: "finance",
              label: "تمويل بنكي",
              order: 2,
              isActive: true,
            },
          ]);
        }
      } else if (step.title === "اللمسات الأخيرة") {
        await db.insert(formFields).values([
          {
            stepId: step.id,
            name: "smartTags",
            label: "التاقات الذكية",
            type: "chips",
            placeholder: "اختر التاقات",
            required: false,
            order: 1,
            isActive: true,
          },
        ]);

        const tagsField = await db
          .select()
          .from(formFields)
          .where(eq(formFields.stepId, step.id))
          .limit(1);

        if (tagsField[0]) {
          // إضافة التاقات حسب نوع العقار المختار
          // سنضيف التاقات العامة أولاً
          const allTags = new Set<string>();
          Object.values(SPECIFIC_TAGS).forEach((tags) => {
            tags.forEach((tag) => allTags.add(tag));
          });

          let order = 1;
          for (const tag of Array.from(allTags)) {
            await db.insert(fieldOptions).values({
              fieldId: tagsField[0].id,
              value: tag,
              label: tag,
              order: order++,
              isActive: true,
            });
          }
        }
      }
      }
      }
      console.log("✅ تم إنشاء نموذج المشتري بنجاح");
    }

    // 2. إنشاء نموذج البائع (مبسط)
    let sellerForm;
    if (existingNames.includes("seller_form")) {
      console.log("📝 نموذج البائع موجود بالفعل، تخطي...");
      sellerForm = existingConfigs.find((c) => c.name === "seller_form");
    } else {
      console.log("📝 إنشاء نموذج البائع...");
      const [newSellerForm] = await db
        .insert(formConfigs)
        .values({
          name: "seller_form",
          formType: "seller",
          displayName: "نموذج البائع",
          description: "نموذج إضافة عقار للبيع",
          isActive: true,
        })
        .returning();
      sellerForm = newSellerForm;
      console.log("✅ تم إنشاء نموذج البائع بنجاح");
    }

    // 3. إنشاء نموذج المستثمر
    let investorForm;
    if (existingNames.includes("investor_form")) {
      console.log("📝 نموذج المستثمر موجود بالفعل، تخطي...");
      investorForm = existingConfigs.find((c) => c.name === "investor_form");
    } else {
      console.log("📝 إنشاء نموذج المستثمر...");
      const [newInvestorForm] = await db
        .insert(formConfigs)
        .values({
          name: "investor_form",
          formType: "investor",
          displayName: "نموذج المستثمر",
          description: "نموذج تسجيل رغبات المستثمر",
          isActive: true,
        })
        .returning();
      investorForm = newInvestorForm;

      // خطوات نموذج المستثمر (مشابهة للمشتري مع إضافات)
      const investorSteps = [
        { title: "المعلومات الشخصية", description: "الاسم والهاتف والبريد", icon: "User", order: 1 },
        { title: "المدينة", description: "اختيار المدينة", icon: "MapPin", order: 2 },
        { title: "الأحياء", description: "اختيار الأحياء المفضلة", icon: "MapPin", order: 3 },
        { title: "نوع العقار", description: "اختيار نوع العقار", icon: "Home", order: 4 },
        { title: "المواصفات", description: "الغرف والمساحة", icon: "Ruler", order: 5 },
        { title: "الميزانية", description: "نطاق الميزانية", icon: "Wallet", order: 6 },
        { title: "طريقة الدفع", description: "كاش أو تمويل", icon: "CreditCard", order: 7 },
        { title: "اللمسات الأخيرة", description: "التاقات الذكية", icon: "Sparkles", order: 8 },
      ];

      for (const stepData of investorSteps) {
        await db.insert(formSteps).values({
          formId: investorForm.id,
          ...stepData,
          isRequired: true,
          isActive: true,
        });
      }

      console.log("✅ تم إنشاء نموذج المستثمر بنجاح");
    }

    console.log("🎉 اكتمل الترحيل بنجاح!");
  } catch (error: any) {
    console.error("❌ خطأ في الترحيل:", error);
    throw error;
  }
}

// تشغيل الترحيل إذا تم استدعاء الملف مباشرة
migrateFormConfigs()
  .then(() => {
    console.log("✅ اكتمل الترحيل");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ فشل الترحيل:", error);
    process.exit(1);
  });

export { migrateFormConfigs };

