# دليل النشر على VPS (اكتف اوردر)

## المتطلبات
- Node.js **22.5 أو أحدث** (قاعدة البيانات تستخدم وحدة `node:sqlite` المدمجة — لا حاجة لتثبيت أي مكتبات).
- ذاكرة 512MB تكفي. مساحة قرص 1GB كافية للبداية.

## أول تشغيل على السيرفر
```bash
# 1) فك الضغط وادخل المجلد
unzip active-tecno.zip && cd active-tecno

# 2) (اختياري) انسخ ملف البيئة وعدّله
cp .env.example .env

# 3) التشغيل
node server.js
```
قاعدة البيانات تُنشأ تلقائياً في `data/runtime.db` من النسخة الأساسية `data/seed.db` عند أول تشغيل. بياناتك الفعلية تعيش في `data/runtime.db` ومجلد `data/uploads/` — هذه هي الوحيدة التي يجب الحفاظ عليها بين التحديثات.

## التشغيل الدائم (systemd)
```ini
# /etc/systemd/system/active-tecno.service
[Unit]
Description=Active Tecno
After=network.target

[Service]
WorkingDirectory=/opt/active-tecno
Environment=PORT=3000
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable --now active-tecno
```

## ربط الدومين (nginx + HTTPS)
```nginx
server {
    server_name your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
ثم فعّل الشهادة: `sudo certbot --nginx -d your-domain.com`

## استمرارية البيانات والنسخ الاحتياطي
- كل البيانات الحية في ملف واحد: `data/runtime.db` (+ ملفاته المساعدة `-wal`/`-shm`) ومجلد `data/uploads/`.
- نسخة احتياطية يدوية: أوقف الخدمة ثم انسخ `data/` كاملة، أو انسخ الملفات أثناء التشغيل بأمر SQLite:
  `node -e "const{DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('data/runtime.db');d.exec(\"VACUUM INTO 'backups/runtime-'+Date.now()+'.db'\");d.close();"`
- **عند التحديث لنسخة أحدث**: استبدل ملفات الكود فقط ولا تحذف `data/runtime.db` ولا `data/uploads/`. ملف `data/seed.db` هو البيانات التجريبية الأولية ولا يُستخدم بعد أول تشغيل.

## الحسابات الافتراضية
- لوحة التاجر (تجريبي): demo@activetecno.software / demo1234 — احذفها أو غيّر كلمة مرورها قبل التشغيل الحقيقي من قاعدة البيانات.
- لوحة الإدارة: admin@activetecno.software / admin1234 — **غيّر كلمة المرور فوراً** قبل أي نشر عام.

## ملاحظات أمان أساسية
- غيّر كلمات مرور الحسابات الافتراضية قبل ربط الدومين.
- اجعل الجدار الناري يسمح فقط بمنافذ 80/443 (التطبيق يستمع على 3000 محلياً خلف nginx).

## ما هو مُنفّذ فعلياً مقابل التكاملات الخارجية غير المربوطة بعد

### يعمل بالكامل من الكود وحده (بدون أي خدمة خارجية)
- إدارة المتجر والمنتجات والأقسام والطلبات (كل الحالات، الفلاتر، الترقيم، الإجراءات الجماعية، مستوى الخطورة الاسترشادي)، السلة والدفع عند الاستلام، صفحات المتجر والثيمات والمحرر، المدونة، Funnels، الإحصائيات، التذاكر الداخلية، لوحة الإدارة (تفعيل الاشتراكات اليدوي عبر InstaPay / Vodafone Cash)، ويبهوك الطلبات الصادرة مع توقيع HMAC وسجل التسليم.
- إشعارات الأحداث داخل اللوحة (تنبيهات الطلبات الجديدة) تعمل محلياً.

### تكاملات خارجية تحتاج مفاتيحك قبل أن تعمل فعلياً
هذه المسارات مبنية ومختبرة على مستوى الكود، لكنها **لا تتصل بأي مزوّد حقيقي حتى تضيف مفاتيحك** من لوحة الإدارة ← التكاملات أو كمتغيرات بيئة. بدون المفاتيح تعمل في وضع محاكاة مسجَّل داخلياً (لا يظهر للعملاء):
- **Paymob** (بوابة الدفع الإلكتروني): `PAYMOB_API_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_IFRAME_ID`. بدونها يبقى الدفع عند الاستلام فقط.
- **WhatsApp Cloud API** (تأكيد الطلبات): `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, و`WHATSAPP_VERIFY_TOKEN` لاستقبال الويبهوك.
- **البريد الإلكتروني** (رسائل التحقق): `RESEND_API_KEY`, `EMAIL_FROM`. بدونها تظهر رموز التحقق في سجل الأحداث الداخلي فقط.
- **بيكسلات التتبع** (Meta / TikTok / Snap / Google Analytics وConversion API): تُحقن أكوادها في المتجر بعد إدخال المعرّفات من إعدادات التتبع؛ بدونها لا يُرسل أي تتبع.

### ملاحظة عن معاينة Render المجانية
المعاينة الحالية على Render تعمل بنظام ملفات مؤقت، لذلك تعاد تهيئة قاعدة البيانات وتُمسح الجلسات عند كل نشر جديد. هذا سلوك الاستضافة المجانية فقط؛ على VPS تبقى البيانات والجلسات محفوظة في `data/runtime.db` بين عمليات إعادة التشغيل والتحديثات (تم التحقق من ذلك باختبار استخراج نظيف مع إعادة تشغيل فعلية للعملية).
