# Self-Hosted Deployment Guide

This guide explains how to run QR Menu on your own server for both local and global access.

## **Local Network Access (Same WiFi/LAN)**

### Step 1: Find Your Computer's IP Address
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

### Step 2: Start the Server
```powershell
npm run dev
```

Server will show:
```
Running on port 5000
📍 http://localhost:5000
🌐 http://192.168.1.100:5000
🌍 http://YOUR_DOMAIN:5000
```

### Step 3: Access from Multiple Devices

**On the same device (your computer):**
```
http://localhost:5000
```

**From another device on same network:**
```
http://192.168.1.100:5000  (replace with your IP)
```

### Testing:
1. Open customer page on Device A: `http://192.168.1.100:5000`
2. Open staff dashboard on Device B: `http://192.168.1.100:5000/staff-dashboard.html`
3. Place order from Device A → See it appear instantly on Device B ✅

---

## **Global Access (From Anywhere on Internet)**

### Prerequisites:
- Your server running 24/7
- Router/ISP that allows port forwarding
- Static IP or Dynamic DNS

### Step 1: Get Your Public IP
```powershell
# Open PowerShell and run:
(Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
```
This gives your public IP (e.g., `203.45.67.89`)

### Step 2: Enable Port Forwarding (Router Setup)

On your router (192.168.1.1 typically):
- Forward external port **5000** to your computer's IP (**192.168.1.100:5000**)
- This makes your server accessible from the internet

### Step 3: Test Global Access

**From anywhere, use:**
```
http://YOUR_PUBLIC_IP:5000
```

Example:
```
Customer page: http://203.45.67.89:5000
Staff dashboard: http://203.45.67.89:5000/staff-dashboard.html
```

---

## **Domain Setup (Optional but Recommended)**

If your IP keeps changing, use Dynamic DNS:

1. Get a free domain from [noip.com](https://www.noip.com) or [duckdns.org](https://www.duckdns.org)
2. Map your dynamic IP to a domain name
3. Share the domain instead of IP:
```
http://your-restaurant.duckdns.org:5000
```

---

## **For Production (Always Running)**

### Option 1: Windows Task Scheduler
1. Create batch file `start-server.bat`:
```batch
cd D:\Achu\Work\QR-MENU
npm start
pause
```

2. Open Task Scheduler
3. Create task to run this batch file at system startup
4. Set to run whether user is logged in or not

### Option 2: Run as Service
Use `nssm` (Node Service Simple Manager):
```powershell
# Install nssm
choco install nssm

# Install service
nssm install QRMenuServer "C:\nodejs\node.exe" "D:\Achu\Work\QR-MENU\server.js"

# Start service
nssm start QRMenuServer

# Remove service if needed
nssm remove QRMenuServer
```

---

## **Quick Access URLs Cheat Sheet**

| Access Type | URL |
|---|---|
| **Localhost (Your Computer)** | `http://localhost:5000` |
| **Local Network** | `http://192.168.1.100:5000` |
| **Global (Public IP)** | `http://203.45.67.89:5000` |
| **Global (Domain)** | `http://your-domain.duckdns.org:5000` |
| **Staff Dashboard** | Add `/staff-dashboard.html` to any URL above |

---

## **Troubleshooting**

### "Connection Refused" Error
- Ensure server is running: `npm run dev`
- Check if port 5000 is blocked by firewall

### "Connection Timeout" (Global Access)
- Port forwarding not enabled on router
- Router doesn't allow port 5000 (try port 80 or 8080)
- ISP blocking inbound connections (call support)

### Database Not Found
- Ensure MongoDB is running: `Get-Service MongoDB`
- Or use MongoDB Atlas (cloud): Update `MONGODB_URI` in `.env`

### Orders Not Syncing
- Check browser console (F12) for errors
- Ensure WebSocket connection shows as "Connected"
- Verify both devices are on same network or using same global URL

---

## **Security Notes**

⚠️ For global access:
1. Change default staff password in `staff-login.js`
2. Consider using HTTPS (requires SSL certificate)
3. Use a VPN if accessing through public network
4. Keep MongoDB secured (use auth)

---

## **Database Setup**

### Local MongoDB
```powershell
Get-Service MongoDB
Start-Service MongoDB
```

### Cloud MongoDB (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `.env`:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/qr-menu
```

---

**Your system is now ready for local network AND global access!** 🚀
