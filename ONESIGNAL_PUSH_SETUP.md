# 📱 OneSignal Push Notifications Setup Guide

## 🎯 What You'll Get

- ✅ **Real push notifications** on desktop and mobile
- ✅ Works even when browser is closed
- ✅ iOS and Android support
- ✅ Financial alerts (low runway, payments, expenses)
- ✅ FREE for up to 10,000 subscribers

---

## 🚀 Step-by-Step Setup

### Step 1: Create OneSignal Account (5 minutes)

1. **Go to OneSignal:**
   ```
   https://onesignal.com
   ```

2. **Click "Get Started Free"**
   - Sign up with email or Google
   - No credit card required

3. **You'll be redirected to the dashboard**

---

### Step 2: Create a New App

1. **Click "New App/Website"** (big blue button)

2. **Enter App Details:**
   - **App Name:** `Aura CFO` (or whatever you like)
   - **Select Platform:** Choose **"Web"** first
   - Click **"Next"**

3. **Web Configuration:**
   - **Site URL:** `http://localhost:3000` (for development)
   - **Auto Resubscribe:** Toggle **ON** (recommended)
   - **Site Name:** `Aura CFO`
   - Click **"Save"**

4. **You'll see "Configuration Successful"** ✅

---

### Step 3: Get Your API Keys

1. **Go to Settings → Keys & IDs:**
   ```
   Click on your app → Settings → Keys & IDs
   ```

2. **Copy these TWO values:**
   
   **A. App ID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
   - This is at the top of the page
   - Copy it!
   
   **B. REST API Key** (looks like: `os_v2_app_xxxxxxxxxxxxx`)
   - Scroll down to "REST API Key"
   - Click "Show" to reveal it
   - Copy it!

---

### Step 4: Add Keys to `.env.local`

Open your `.env.local` file and update these lines:

```bash
# =======================================
# ONESIGNAL PUSH NOTIFICATIONS
# =======================================

NEXT_PUBLIC_ONESIGNAL_APP_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
ONESIGNAL_REST_API_KEY=os_v2_app_xxxxxxxxxxxxx
```

**Replace with your actual keys!**

---

### Step 5: Restart Dev Server

Stop your current server (Ctrl+C) and restart:

```bash
pnpm dev
```

---

### Step 6: Test on Desktop

1. **Go to Notification Settings:**
   ```
   http://localhost:3000/settings/notifications
   ```

2. **You'll see the "📱 Mobile Push Notifications" card**

3. **Click "Enable Mobile Push"**

4. **Browser will ask:** "Allow notifications?"
   - Click **"Allow"** ✅

5. **Click "Send Test Push to Phone"**

6. **You should see TWO notifications:**
   - 🚨 Low Runway Alert
   - 💰 Payment Received

---

### Step 7: Test on Mobile Phone

#### Option A: Using Your Computer's IP (Same WiFi)

1. **Find your computer's IP address:**
   - Look at your terminal where `pnpm dev` is running
   - You'll see: `Network: http://192.168.X.X:3000`
   - Example: `http://192.168.1.203:3000`

2. **On your phone:**
   - Connect to the **same WiFi** as your computer
   - Open browser (Chrome/Safari)
   - Go to: `http://192.168.X.X:3000/settings/notifications`
   - Replace X.X with your actual IP

3. **Click "Enable Mobile Push"**

4. **Allow notifications when prompted**

5. **Click "Send Test Push"**

6. **You should receive push notifications!** 📱

#### Option B: Using ngrok (For Testing from Anywhere)

If you want to test from outside your WiFi:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** (looks like: `https://abc123.ngrok.io`)

4. **Update OneSignal:**
   - Go to OneSignal Dashboard
   - Settings → All Platforms
   - Add your ngrok URL as "Site URL"
   - Save

5. **Access on phone:**
   - Use the ngrok URL on your phone
   - Enable notifications
   - Test!

---

## 🧪 Testing Different Scenarios

### Test Low Runway Alert

```typescript
import { sendLowRunwayAlert } from '@/lib/push-notification-service'

// Send alert for 5.2 months runway with $45,000 cash
await sendLowRunwayAlert(5.2, 45000)
```

### Test Payment Received

```typescript
import { sendPaymentReceivedAlert } from '@/lib/push-notification-service'

// Send alert for $25,000 payment from Acme Corp
await sendPaymentReceivedAlert(25000, 'Acme Corp')
```

### Test Large Expense

```typescript
import { sendLargeExpenseAlert } from '@/lib/push-notification-service'

// Send alert for $15,000 expense
await sendLargeExpenseAlert(15000, 'New Server Equipment')
```

---

## 📊 View Push Notification Stats

1. **Go to OneSignal Dashboard:**
   ```
   https://app.onesignal.com
   ```

2. **Click on your app**

3. **Dashboard shows:**
   - 📈 Total subscribers
   - 📬 Notifications sent
   - 👆 Click-through rate
   - 📱 Device types (iOS/Android/Web)

---

## 🎨 Customize Notification Icon (Optional)

1. **Add icon to your `public` folder:**
   - Create: `public/notification-icon.png`
   - Size: 256x256 pixels
   - PNG format

2. **Update OneSignal settings:**
   - Dashboard → Settings → All Platforms
   - Upload icon
   - Save

---

## 🐛 Troubleshooting

### Problem: "Enable Mobile Push" button doesn't appear

**Solution:**
1. Check `.env.local` has `NEXT_PUBLIC_ONESIGNAL_APP_ID`
2. Restart dev server: `pnpm dev`
3. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
4. Check browser console for errors

### Problem: Browser doesn't ask for permission

**Solution:**
1. Check if notifications are blocked in browser settings
2. Chrome: `chrome://settings/content/notifications`
3. Remove your localhost from blocked list
4. Try again

### Problem: Notifications don't show up

**Solution:**
1. Check browser console for errors
2. Verify both App ID and REST API Key are correct
3. Make sure you clicked "Allow" when prompted
4. Check OneSignal dashboard for errors
5. Try sending from OneSignal dashboard directly

### Problem: "Failed to send notification"

**Solution:**
1. Verify `ONESIGNAL_REST_API_KEY` is correct
2. Make sure it's the REST API Key, not the App ID
3. Check you have at least one subscriber
4. View "Delivery" tab in OneSignal dashboard for details

### Problem: Works on desktop but not mobile

**Solution:**
1. Make sure mobile phone is on same WiFi
2. Use the Network URL (e.g., `http://192.168.1.203:3000`)
3. NOT `localhost` on mobile!
4. Check mobile browser supports push (Chrome, Safari)
5. For iOS: requires iOS 16.4+ and "Add to Home Screen"

---

## 📱 Production Deployment

When deploying to production:

1. **Update OneSignal Site URL:**
   - Go to OneSignal Dashboard
   - Settings → All Platforms
   - Change Site URL to your production domain
   - Example: `https://yourdomain.com`
   - Save

2. **Update environment variables:**
   - Add keys to your production host (Vercel, Netlify, etc.)
   - Use the same App ID and REST API Key

3. **Test on production:**
   - Visit your live site
   - Enable notifications
   - Send test push

---

## 🎯 Where Notifications Appear

### In Your App:

1. **Dashboard Widget** (`/dashboard`)
   - Shows recent alerts
   - Click to view details

2. **Floating Bell Icon** (all pages, bottom-right)
   - Shows unread count
   - Click to see recent notifications

3. **Settings Page** (`/settings/notifications`)
   - Configure preferences
   - Test notifications
   - Enable/disable types

### Outside Your App:

4. **Browser Notifications** (desktop)
   - Show even when app is closed
   - Click to open app

5. **Mobile Push** (iOS/Android)
   - Show on lock screen
   - Show in notification center
   - Persistent even when browser closed

---

## ✅ Checklist

- [ ] Created OneSignal account
- [ ] Created new Web app in OneSignal
- [ ] Copied App ID
- [ ] Copied REST API Key
- [ ] Added both keys to `.env.local`
- [ ] Restarted dev server
- [ ] Tested on desktop browser
- [ ] Allowed notifications when prompted
- [ ] Received test notifications
- [ ] Tested on mobile phone (optional)

---

## 📚 Learn More

- **OneSignal Docs:** https://documentation.onesignal.com/
- **Web Push Guide:** https://documentation.onesignal.com/docs/web-push-quickstart
- **Testing Guide:** https://documentation.onesignal.com/docs/testing-web-push

---

## 💡 Tips

- **Use descriptive titles:** Make it clear what the alert is about
- **Keep messages short:** 50 characters or less for best results
- **Include amounts:** Always show dollar values
- **Add emojis:** Makes notifications stand out
- **Link to relevant page:** Users can click to see details
- **Test regularly:** Make sure notifications work after changes

---

**🎉 You're all set! Your financial alerts will now reach users anywhere, anytime!**



