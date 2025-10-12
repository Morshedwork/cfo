# 📱 OneSignal Mobile Push Notifications Setup

Get real mobile push notifications for financial alerts in 5 minutes!

---

## 🚀 Quick Setup (FREE)

### Step 1: Create OneSignal Account
1. Go to [https://onesignal.com](https://onesignal.com)
2. Click **"Get Started Free"**
3. Sign up (email or Google)

### Step 2: Create New App
1. Click **"New App/Website"**
2. Name: `Aura CFO`
3. Select platform:
   - ✅ **Web Push** (Chrome, Firefox)
   - ✅ **Apple iOS** (Safari, iOS apps)
   - ✅ **Google Android** (Chrome, Android apps)

### Step 3: Web Push Configuration
1. Select **"Web Push"**
2. Enter your site URL: `https://your-domain.com`
3. For localhost testing: `http://localhost:3000`
4. Click **"Save"**

### Step 4: Get Your Keys
1. Go to **Settings** → **Keys & IDs**
2. Copy:
   - **OneSignal App ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **REST API Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 5: Add to Your Project
Create `.env.local` file in your project root:

```bash
# OneSignal Configuration
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-app-id-here
ONESIGNAL_REST_API_KEY=your-rest-api-key-here
```

### Step 6: Install OneSignal SDK
```bash
npm install react-onesignal
```

### Step 7: Test It!
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/settings/notifications`
3. Click **"Enable Mobile Push"**
4. Allow notifications when prompted
5. Click **"Send Test Push to Phone"**
6. 🎉 You should see notifications on your phone!

---

## 📱 Testing on Mobile

### Android (Chrome/Firefox):
1. Open `http://your-local-ip:3000` on phone
2. Or deploy to Vercel and test
3. Enable notifications
4. Receive alerts!

### iOS (Safari):
1. Works on iOS 16.4+
2. Open in Safari browser
3. "Add to Home Screen" for best experience
4. Enable notifications

---

## 🎯 What You Get

✅ **Low Runway Alerts**: "Your runway is 5.2 months"
✅ **Payment Received**: "$25,000 from Acme Corp"
✅ **Large Expenses**: "$15,000 AWS charge detected"
✅ **Invoice Overdue**: "Invoice #1234 is 30 days overdue"
✅ **Burn Rate Spikes**: "Monthly burn increased 25%"

---

## 🔧 How It Works

```typescript
// Automatic alerts from financial events
if (runway < 6 months) {
  pushNotificationService.sendToAll({
    title: '🚨 Low Runway Alert',
    message: `Your runway is ${runway} months`,
    url: '/runway'
  })
}
```

---

## 💰 Pricing

OneSignal is **FREE** for:
- ✅ Unlimited push notifications
- ✅ Unlimited devices
- ✅ Unlimited users
- ✅ All features

Perfect for startups! 🚀

---

## 🆘 Troubleshooting

### Notifications not working?
1. Check `.env.local` has correct keys
2. Restart dev server after adding keys
3. Clear browser cache
4. Try incognito mode
5. Check browser console for errors

### iOS not working?
- iOS requires HTTPS (deploy to Vercel first)
- Safari on iOS 16.4+ only
- Works best as "Add to Home Screen" app

### Need help?
OneSignal has excellent docs: [https://documentation.onesignal.com](https://documentation.onesignal.com)

---

## 🎉 Done!

Your users will now get real-time financial alerts on their phones, even when the app is closed!

**Next steps:**
- Set up automatic alerts for financial events
- Customize notification thresholds in Settings
- Send targeted alerts to specific users

