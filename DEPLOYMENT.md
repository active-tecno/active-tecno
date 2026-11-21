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
