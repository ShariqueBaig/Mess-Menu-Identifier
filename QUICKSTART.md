# Quick Start Guide

## 🚀 Running the Application

### Start the server:

```bash
npm start
```

### Open in browser:

```
http://localhost:3000
```

### Default admin credentials:

- Password: `admin123`

---

## 📁 What Changed?

Your code is now **modularized and secure**:

### Before (Single File):

- ❌ Everything in `index.html` (~1000+ lines)
- ❌ Password stored in client code (visible in browser)
- ❌ Easy to find and bypass authentication

### After (Modular + Secure):

- ✅ Separate files: HTML, CSS, and JS modules
- ✅ Password stored **server-side only** (bcrypt hashed)
- ✅ JWT token-based authentication
- ✅ Backend API for password verification
- ✅ Ready for production deployment

---

## 🔒 Security Improvements

1. **Password is hidden from users**

   - Not visible in browser DevTools or page source
   - Stored as bcrypt hash in `.env` file server-side

2. **Token-based authentication**

   - Admin receives JWT token valid for 24 hours
   - Token required for protected operations

3. **Environment variables**
   - Secrets stored in `.env` (git-ignored)
   - Easy to change without modifying code

---

## 📋 File Structure

```
📁 Mess Menu Identifier/
│
├── 📄 index.html          → Clean HTML markup only
├── 🎨 styles.css          → All visual styles
│
├── 📁 js/
│   ├── app.js            → Main app initialization
│   ├── menu.js           → Menu parsing & display
│   ├── admin.js          → Admin auth (API calls)
│   └── storage.js        → LocalStorage management
│
├── 🔧 server.js           → Express backend + auth API
├── 📦 package.json        → Dependencies
├── 🔐 .env               → Secret credentials (git-ignored)
├── 📝 .env.example       → Template for .env
├── 🚫 .gitignore         → Excluded files
└── 📖 README.md          → Full documentation
```

---

## 🌐 Deploying to Production

### Option 1: Heroku

```bash
heroku create your-app-name
heroku config:set JWT_SECRET=random-string-here
heroku config:set ADMIN_PASSWORD_HASH=your-bcrypt-hash
git push heroku main
```

### Option 2: Vercel

```bash
vercel
# Then set environment variables in dashboard
```

### Option 3: Railway / Render

1. Connect GitHub repo
2. Set environment variables in dashboard
3. Auto-deploy on push

**Important:** Always set these environment variables:

- `JWT_SECRET` (random long string)
- `ADMIN_PASSWORD_HASH` (bcrypt hash of your password)

---

## 🔑 Changing Admin Password

1. Generate new hash:

```bash
npm run generate-hash YourNewPassword
```

2. Copy the hash output

3. Update `.env`:

```
ADMIN_PASSWORD_HASH=paste-hash-here
```

4. Restart server:

```bash
npm start
```

---

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] Page loads at http://localhost:3000
- [ ] Admin button visible in top-right
- [ ] Click Admin → Enter "admin123" → Unlocks admin controls
- [ ] Upload a PDF → Menu parses and displays
- [ ] Previous/Next buttons work
- [ ] Menu persists after page refresh
- [ ] Password NOT visible in browser DevTools/source

---

## 🆘 Troubleshooting

**Server won't start:**

- Run `npm install` to install dependencies
- Check if `.env` file exists

**Authentication fails:**

- Verify `.env` has `ADMIN_PASSWORD_HASH`
- Restart server after changing `.env`

**Menu not displaying:**

- Check browser console for errors
- Verify PDF uploaded successfully
- Check localStorage in DevTools

---

## 📞 Need Help?

Refer to full documentation in `README.md`
