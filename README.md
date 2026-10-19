# 🎭 StageTix — לקוח (React)

לקוח פשוט שמדגים את שרת StageTix מקצה לקצה: התחברות, רשימת הופעות עם דפדוף מול השרת, הזמנת כיסאות, **והצגה ברורה של 409** כשכיסא נתפס, וגם מסכי ניהול למנהלת.

השרת נמצא ב־Repository נפרד: **stagetix-server**.

## המסכים
| # | מסך | נתיב | מי |
|---|---|---|---|
| 1 | התחברות והרשמה | `#/login` | כולם |
| 2 | רשימת הופעות: חיפוש, קטגוריה, מיון, דפדוף מול השרת | `#/shows` | כולם |
| 3 | מפת כיסאות והזמנה | `#/shows/:id` | כולם (הזמנה: קונה) |
| 4 | **חלון 409: "המקום נתפס!"** | בתוך מסך 3 | קונה |
| 5 | ההזמנות שלי | `#/my-orders` | קונה |
| 6 | ניהול הופעות: יצירה, עריכה, פרסום, ביטול, מחיקה | `#/admin/shows` | מנהלת |
| 7 | ניהול הזמנות: כל ההזמנות, סינון, ביטול | `#/admin/orders` | מנהלת |

הסתרת מסכים לפי תפקיד נעשית **לנוחות בלבד**. ההרשאה האמיתית נבדקת בשרת (401 או 403).

## הרצה מקומית
דרישות: Node.js 20 ומעלה, ושרת StageTix שרץ.

```powershell
cd client
copy .env.example .env      # ובתוכו: VITE_API_URL=http://localhost:5248
npm install
npm run dev                 # http://localhost:5173
```

כתובת השרת מגיעה **רק** מהמשתנה `VITE_API_URL`, ולא כתובה בקוד. Vite "צורב" אותה בזמן ה־build, ולכן אחרי שינוי שלה צריך להריץ build מחדש (ב־Render זה קורה ב־Deploy חדש).

## איך מדגימים 409
1. פתחי שני חלונות: חלון רגיל וחלון גלישה בסתר (Ctrl+Shift+N).
2. בחלון אחד התחברי כ־`dana@example.com`, ובשני כ־`noa@example.com`. הסיסמה בשניהם: `Customer123!`.
3. בשני החלונות פתחי את **"ערב ניגונים — כמעט אזל!"** ובחרי את **שורה 10, כיסאות 6 ו־7**.
4. לחצי **"הזמיני"** בחלון של דנה: ההזמנה מצליחה 🎉
5. לחצי **"הזמיני"** בחלון של נועה: נפתח החלון האדום **"המקום נתפס!"** (HTTP 409).
6. כדי לאפס את ההדגמה: התחברי כמנהלת, ובמסך "ניהול הזמנות" בטלי את ההזמנה של דנה.

## מבנה
```
src/
├── api/          client.js (fetch, Token, שגיאות), endpoints.js (כל ה־URLs)
├── auth/         AuthContext.jsx (JWT ב־localStorage, התחברות והתנתקות)
├── hooks/        useApiData (טעינה), useAdminAction (פעולות מנהלת)
├── components/   Layout, SeatMap, ConflictDialog, Pagination, OrdersTable, ShowForm, ErrorBanner, RequireAuth
├── pages/        7 המסכים
└── utils/        format.js (תוויות בעברית, תאריכים, מחירים)
```

## פריסה ב־Render (Static Site)
- **Build Command:** `npm ci && npm run build`
- **Publish Directory:** `dist`
- **Environment:** `VITE_API_URL=https://<השרת שלך>.onrender.com`

הלקוח משתמש ב־HashRouter (כתובות בצורה `/#/shows`), ולכן לא צריך להגדיר Rewrite Rules.
