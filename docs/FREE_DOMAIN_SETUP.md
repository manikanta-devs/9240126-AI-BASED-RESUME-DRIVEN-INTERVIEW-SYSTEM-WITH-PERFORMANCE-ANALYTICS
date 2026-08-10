# 🌐 Free Custom Domain Setup Guide (DigitalPlat / FreeDomain)

This guide explains how to claim a **100% free custom domain** (e.g. `talentforge-ai.dpdns.org` or `talentforge-ai.us.kg`) from the **[DigitalPlatDev/FreeDomain](https://github.com/DigitalPlatDev/FreeDomain)** project and link it to your **TalentForge AI** application with **free HTTPS / SSL protection**.

---

## 📌 Prerequisites

1. A **GitHub Account**
2. A free **[Cloudflare Account](https://dash.cloudflare.com/sign-up)** (for managing DNS & free SSL certificates)
3. Your deployment link (e.g. Vercel, Render, or a local tunnel IP/URL)

---

## 🚀 Step 1: Claim Your Free Domain

1. Go to the official **DigitalPlat FreeDomain Registration Portal**:
   👉 **[https://nic.dpdns.org/](https://nic.dpdns.org/)** (or via the [DigitalPlatDev GitHub Repository](https://github.com/DigitalPlatDev/FreeDomain))
2. Sign in with your **GitHub Account**.
3. Choose your desired domain name prefix and extension:
   - Example: `talentforge-ai.dpdns.org`
   - Example: `talentforge-ai.us.kg`
   - Example: `talentforge-ai.qzz.io`
4. Click **Register Domain**.

---

## ⚡ Step 2: Connect Domain to Cloudflare

1. Log into your **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. Click **Add a Site** and enter your registered domain (e.g., `talentforge-ai.dpdns.org`).
3. Select the **Free Plan** and copy Cloudflare's assigned **Nameservers**:
   - `ns1.cloudflare.com`
   - `ns2.cloudflare.com`
4. Return to your **DigitalPlat NIC Dashboard** and set the NS records to Cloudflare's nameservers.

---

## 🛠️ Step 3: Configure DNS Records for TalentForge AI

In your Cloudflare DNS dashboard, add the target destination for your frontend and backend:

### Option A: Hosted on Vercel + Render
| Type | Name | Target | Proxy Status |
| :--- | :--- | :--- | :--- |
| **CNAME** | `@` | `cname.vercel-dns.com` | 🟠 Proxied (Orange Cloud) |
| **CNAME** | `api` | `mca-final-project.onrender.com` | 🟠 Proxied (Orange Cloud) |

### Option B: Local Server / VPS (Static IP)
| Type | Name | Target | Proxy Status |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `YOUR_PUBLIC_SERVER_IP` | 🟠 Proxied (Orange Cloud) |
| **A** | `api` | `YOUR_PUBLIC_SERVER_IP` | 🟠 Proxied (Orange Cloud) |

---

## 🔐 Step 4: Update `.env.production` in TalentForge AI

After binding your domain, update your `.env.production` file so CORS allows requests from your new domain:

```env
# .env.production
ALLOWED_ORIGINS=https://talentforge-ai.dpdns.org,https://api.talentforge-ai.dpdns.org
VITE_API_BASE_URL=https://api.talentforge-ai.dpdns.org
```

---

## ✅ Verification Checklist

- [ ] Domain registered on `nic.dpdns.org`
- [ ] Cloudflare DNS status shows **Active**
- [ ] HTTPS / SSL mode set to **Full** on Cloudflare
- [ ] `https://your-domain.dpdns.org` loads the TalentForge AI React dashboard!
