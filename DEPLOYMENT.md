# הוראות Deployment ל-VPS

## 1. הגדרת VPS

### התקנת תלויות
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm git nginx sqlite3

# התקן PM2 לניהול process
sudo npm install -g pm2
```

### יצירת תיקיית האפליקציה
```bash
sudo mkdir -p /var/www/smart-schedule
sudo chown -R $USER:$USER /var/www/smart-schedule
cd /var/www/smart-schedule
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### התקנת תלויות והרצה ראשונית
```bash
cd /var/www/smart-schedule
npm ci
npm run build
pm2 start server.js --name smart-schedule
pm2 startup systemd
pm2 save
```

## 2. הגדרת Nginx

### יצירת קובץ config
```bash
sudo nano /etc/nginx/sites-available/smart-schedule
```

### תוכן הקובץ:
```nginx
server {
    listen 80;
    server_name YOUR_IP_OR_DOMAIN;  # ← IP או דומיין

    # Frontend (React app)
    location / {
        root /var/www/smart-schedule/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3015;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads {
        alias /var/www/smart-schedule/uploads;
    }
}
```

### הפעלת האתר ב-Nginx
```bash
sudo ln -s /etc/nginx/sites-available/smart-schedule /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 3. SSL עם Certbot (HTTPS) - רק אם יש דומיין

```bash
# אם יש לך דומיין מחובר:
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR-DOMAIN.COM -d www.YOUR-DOMAIN.COM

# אם עובדים רק עם IP, SSL לא נדרד (או משתמשים ב-self-signed)
```

## 4. הגדרת GitHub Actions Secrets

הוסף את ה-secrets הבאים ב-Repository → Settings → Secrets and variables → Actions:

| Secret Name | Description |
|-------------|-------------|
| `VPS_HOST` | כתובת IP או דומיין של ה-VPS |
| `VPS_USER` | שם משתמש SSH (לרוב `root` או `ubuntu`) |
| `VPS_SSH_KEY` | מפתח SSH פרטי (תוכן של `~/.ssh/id_rsa`) |

### יצירת מפתח SSH:
```bash
# על המחשב המקומי
ssh-keygen -t rsa -b 4096 -C "github-actions"
cat ~/.ssh/id_rsa.pub  # העתק ל-VPS ל-~/.ssh/authorized_keys
cat ~/.ssh/id_rsa      # העתק ל-GitHub Secret VPS_SSH_KEY
```

## 5. עדכון הקוד לפרודקשן

### עדכן את `src/api/localClient.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://YOUR_IP:3015/api'  // ← החלף ב-IP שלך
  : 'http://localhost:3015/api';
```

### שנה את PORT ב-server.js (אופציונלי):
```javascript
const PORT = process.env.PORT || 3015;
```

## 6. בדיקה

```bash
# בדוק שהשרת רץ
pm2 status

# בדוק לוגים
pm2 logs smart-schedule

# בדוק Nginx
sudo systemctl status nginx
```

## 7. מבנה התיקיות ב-VPS

```
/var/www/smart-schedule/
├── dist/              # Frontend build
├── uploads/           # Uploaded files
├── database.js        # DB schema
├── server.js          # Backend
├── schedule.db        # SQLite database
└── package.json
```

## פקודות שימושיות

```bash
# ריסטרט ידני
pm2 restart smart-schedule

# צפייה בלוגים
pm2 logs smart-schedule --lines 100

# עדכון ידני (ללא GitHub Actions)
cd /var/www/smart-schedule && git pull && npm ci && npm run build && pm2 restart smart-schedule

# גיבוי database
scp user@vps:/var/www/smart-schedule/schedule.db ./backup-$(date +%Y%m%d).db
```
