# 🍽️ Mess Menu Tracker

A modern web application for tracking and displaying mess menus with secure admin authentication.

## ✨ Features

- 📄 **PDF Menu Upload**: Extract and parse menu data from PDF files
- 🔒 **Secure Admin Authentication**: Backend-based password verification with JWT tokens
- 💾 **Persistent Storage**: Menu data saved in browser localStorage
- 📅 **Date Navigation**: Browse menus across different days
- 🎯 **Current Meal Highlighting**: Automatically highlights the current serving meal
- 📱 **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Project Structure

```
Mess-Menu-Identifier/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── js/
│   ├── app.js         # Main application entry point
│   ├── menu.js        # Menu parsing and display logic
│   ├── admin.js       # Admin authentication (API calls)
│   └── storage.js     # Data persistence logic
├── server.js          # Node.js backend server
├── package.json       # Node.js dependencies
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 14+ and npm installed
- A modern web browser

### Installation

1. **Clone or download the project**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   copy .env.example .env
   ```

4. **Generate a secure password hash** (optional but recommended)

   To use a custom admin password instead of the default "admin123":

   ```bash
   npm run generate-hash YourNewPassword
   ```

   Copy the generated hash and paste it into `.env` file:

   ```
   ADMIN_PASSWORD_HASH=<paste-your-hash-here>
   ```

5. **Update JWT secret** (important for production)

   Edit `.env` and change the `JWT_SECRET` to a random string:

   ```
   JWT_SECRET=your-random-secret-key-here
   ```

### Running Locally

**Development mode** (auto-restart on file changes):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on `http://localhost:3000`

**Default admin password**: `admin123` (change this in production!)

## 🌐 Deployment

### Deploy to Heroku

1. Create a new Heroku app:

   ```bash
   heroku create your-app-name
   ```

2. Set environment variables:

   ```bash
   heroku config:set JWT_SECRET=your-random-secret-key
   heroku config:set ADMIN_PASSWORD_HASH=your-bcrypt-hash
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

### Deploy to Vercel

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Deploy:

   ```bash
   vercel
   ```

3. Set environment variables in the Vercel dashboard:
   - `JWT_SECRET`
   - `ADMIN_PASSWORD_HASH`

### Deploy to Railway / Render

1. Connect your GitHub repository
2. Set environment variables in the platform dashboard
3. Deploy automatically on push

## 📖 Usage

### For Regular Users

1. Open the application URL
2. View the current day's menu
3. Use ◀ ▶ buttons to browse previous/next days
4. Click **Today** button to return to today's menu

### For Admins

1. Click the **🔒 Admin** button in the top-right
2. Enter the admin password
3. Once authenticated:
   - Upload a new menu PDF
   - Set the menu start date
   - Clear saved data if needed

## 🔒 Security Features

### What's Secure

✅ **Password is NOT visible in client code** - stored server-side only  
✅ **Bcrypt hashing** - passwords are hashed with industry-standard algorithm  
✅ **JWT tokens** - secure session management  
✅ **Environment variables** - secrets stored in `.env` (not committed to git)  
✅ **Session-based auth** - tokens expire after 24 hours

### Important Security Notes

⚠️ **For Production Deployment:**

1. **Change the default password** - Never use "admin123" in production
2. **Generate a unique JWT secret** - Use a long, random string
3. **Use HTTPS** - Always deploy with SSL/TLS enabled
4. **Secure your `.env` file** - Never commit it to version control
5. **Regular updates** - Keep dependencies updated with `npm audit fix`

### Generating Secure Values

**For JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**For password hash:**

```bash
npm run generate-hash YourSecurePassword123!
```

## 🛠️ Development

### File Responsibilities

- **`index.html`**: Markup structure only, imports modular CSS/JS
- **`styles.css`**: All visual styles
- **`js/menu.js`**: PDF parsing, menu data management, display logic
- **`js/admin.js`**: Admin authentication via API calls
- **`js/storage.js`**: LocalStorage persistence
- **`js/app.js`**: Application initialization and coordination
- **`server.js`**: Express server, authentication API

### API Endpoints

**POST `/api/admin/verify`**

- Verifies admin password
- Returns JWT token on success
- Body: `{ "password": "string" }`
- Response: `{ "success": true, "token": "jwt-token" }`

**GET `/api/admin/status`** (protected)

- Checks if admin token is valid
- Requires `Authorization: Bearer <token>` header

## 📝 Environment Variables

| Variable              | Description                   | Default              |
| --------------------- | ----------------------------- | -------------------- |
| `PORT`                | Server port                   | `3000`               |
| `JWT_SECRET`          | Secret key for JWT signing    | `your-secret-key...` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | Hash of "admin123"   |

## 🐛 Troubleshooting

**"Authentication failed" error:**

- Check if the server is running (`npm start`)
- Verify `.env` file exists with correct values

**Menu not displaying:**

- Ensure a PDF has been uploaded by an admin
- Check browser console for errors
- Verify localStorage is not disabled

**Password not working:**

- Regenerate the hash with `npm run generate-hash YourPassword`
- Update the hash in `.env` or your hosting platform's environment variables
- Restart the server

## 📄 License

MIT License - feel free to use and modify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for mess management**
