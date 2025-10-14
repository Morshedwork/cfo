# ⚡ OneSignal Quick Setup (5 Minutes)

## 1️⃣ Sign Up & Create App

```
🔗 https://onesignal.com → Get Started Free
   → New App/Website → Enter "Aura CFO"
   → Platform: Web → Site URL: http://localhost:3000
   → Save
```

---

## 2️⃣ Get Your Keys

```
🔗 Settings → Keys & IDs
```

**Copy these two values:**

- ✅ **App ID:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- ✅ **REST API Key:** `os_v2_app_xxxxxxxxxxxxx`

---

## 3️⃣ Add to `.env.local`

```bash
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_app_id_here
ONESIGNAL_REST_API_KEY=your_rest_api_key_here
```

---

## 4️⃣ Restart Server

```bash
pnpm dev
```

---

## 5️⃣ Test It!

**Desktop:**
```
http://localhost:3000/settings/notifications
→ Click "Enable Mobile Push"
→ Allow notifications
→ Click "Send Test Push"
→ You should receive 2 notifications! ✅
```

**Mobile Phone (same WiFi):**
```
http://192.168.X.X:3000/settings/notifications
(Replace X.X with your computer's IP from terminal)
→ Enable notifications
→ Send test push
→ Check your phone! 📱
```

---

## ✅ Done!

**Notifications will appear:**
- 🖥️ Desktop browser (even when closed)
- 📱 Mobile lock screen
- 🔔 Notification center
- 🎯 Dashboard widget
- 🟣 Floating bell icon

---

## 🐛 Issues?

**Nothing happens?**
1. Check `.env.local` has both keys
2. Restart server
3. Hard refresh: `Ctrl+Shift+R`

**"Enable Mobile Push" missing?**
1. Check browser console for errors
2. Verify App ID in `.env.local`
3. Restart dev server

**Mobile not working?**
1. Use IP address (not localhost)
2. Same WiFi as computer
3. Example: `http://192.168.1.203:3000`

---

📖 **Full Guide:** See `ONESIGNAL_PUSH_SETUP.md` for detailed instructions



