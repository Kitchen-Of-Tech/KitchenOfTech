# 📝 Sanity Studio Setup Guide

## Quick Start: Populate Site Settings

Follow these steps to add your logo, favicon, and site information to Sanity Studio.

---

## 1. Access Sanity Studio

```powershell
# Start your development server
npm run dev

# Open Sanity Studio in your browser
# Go to: http://localhost:3000/studio
```

Or access directly at your deployed Sanity Studio URL.

---

## 2. Create Site Settings Document

### Step 1: Navigate to Site Settings
1. In Sanity Studio, look for **"Site Settings"** in the left sidebar
2. Click on it to create a new document

### Step 2: Fill in Basic Information
```
Site Name: Kitchen of Tech
Site Description: Transform your digital presence with cutting-edge web development, mobile apps, UI/UX design, and creative solutions. Expert team delivering innovative technology solutions.
```

### Step 3: Upload Logo
1. **Logo** field:
   - Click "Upload" or drag & drop your logo file
   - Recommended: **SVG** or **PNG with transparent background**
   - Size: **500x500px** minimum
   - Alt Text: "Kitchen of Tech Logo"

2. **Favicon** field:
   - Click "Upload" or drag & drop your favicon
   - Recommended: **ICO** or **PNG**
   - Size: **32x32px** or **64x64px**
   - Alt Text: "Kitchen of Tech Icon"

### Step 4: Add Contact Information
```
Email: info@kitchenoftech.org
Phone: +1 (555) 123-4567
Address: 123 Tech Street, Innovation City, TC 12345
```

### Step 5: Add Social Media Links
Click **"Add Item"** for each social platform:

```
Facebook:
- Platform: facebook
- URL: https://facebook.com/kitchenoftech

Twitter:
- Platform: twitter  
- URL: https://twitter.com/kitchenoftech

Instagram:
- Platform: instagram
- URL: https://instagram.com/kitchenoftech

LinkedIn:
- Platform: linkedin
- URL: https://linkedin.com/company/kitchenoftech

GitHub:
- Platform: github
- URL: https://github.com/kitchenoftech

YouTube:
- Platform: youtube
- URL: https://youtube.com/@kitchenoftech
```

### Step 6: Configure SEO Settings
```
Meta Title: Kitchen of Tech | Premier IT & Creative Agency
Meta Description: Transform your digital presence with cutting-edge web development, mobile apps, UI/UX design, and creative solutions. Expert team delivering innovative technology solutions.

Keywords (add multiple):
- IT agency
- creative agency
- web development
- mobile apps
- UI/UX design
- digital marketing
- software development
- technology solutions

OG Image:
- Upload a high-quality image (1200x630px)
- This appears when sharing links on social media
```

### Step 7: Save
Click **"Publish"** button (top right)

---

## 3. Create Footer Settings Document

### Step 1: Navigate to Footer Settings
1. In Sanity Studio, look for **"Footer Settings"** in the left sidebar
2. Click to create a new document

### Step 2: Add Company Links
Click **"Add Item"** for each link:

```
About Us:
- Label: About Us
- Href: /about

Careers:
- Label: Careers
- Href: /careers

Contact:
- Label: Contact
- Href: /contact

Blog:
- Label: Blog
- Href: /blog
```

### Step 3: Add Services Links
```
Web Development:
- Label: Web Development
- Href: /services/web-development

Mobile Apps:
- Label: Mobile Apps
- Href: /services/mobile-apps

UI/UX Design:
- Label: UI/UX Design
- Href: /services/ui-ux-design

Digital Marketing:
- Label: Digital Marketing
- Href: /services/digital-marketing
```

### Step 4: Add Resources Links
```
Education:
- Label: Education
- Href: /education

Portfolio:
- Label: Portfolio
- Href: /portfolio

Testimonials:
- Label: Testimonials
- Href: /testimonials

Team:
- Label: Our Team
- Href: /team
```

### Step 5: Add Legal Links
```
Privacy Policy:
- Label: Privacy Policy
- Href: /privacy

Terms of Service:
- Label: Terms of Service
- Href: /terms

Cookie Policy:
- Label: Cookie Policy
- Href: /cookies
```

### Step 6: Custom Copyright Text (Optional)
```
Copyright Text: © 2026 Kitchen of Tech. All rights reserved. Crafted with ❤️
```

### Step 7: Save
Click **"Publish"** button (top right)

---

## 4. Verify Changes

### Test Logo Display
1. Go to homepage: `http://localhost:3000`
2. Check navbar - logo should appear next to site name
3. Scroll down - logo should remain visible in fixed navbar

### Test Favicon
1. Look at browser tab
2. Favicon should appear (may need to clear cache: Ctrl+Shift+R)

### Test Footer
1. Scroll to bottom of any page
2. All footer links should be populated from Sanity
3. Social media icons should be clickable

### Test Metadata
1. View page source (Right-click → View Page Source)
2. Look for `<meta>` tags in `<head>`
3. Should include your custom titles, descriptions, OG tags

---

## 5. Image Best Practices

### Logo Requirements
- **Format:** SVG (vector) or PNG (high-res)
- **Size:** 500x500px minimum
- **Background:** Transparent recommended
- **Colors:** Should work on both light and dark backgrounds
- **File Size:** < 100KB for optimal loading

### Favicon Requirements
- **Format:** ICO, PNG, or SVG
- **Sizes:** Provide 32x32px and/or 64x64px
- **Background:** Can be solid or transparent
- **File Size:** < 10KB

### OG Image (Social Sharing) Requirements
- **Format:** JPG or PNG
- **Size:** Exactly 1200x630px (Facebook/LinkedIn standard)
- **Content:** Include logo + tagline
- **Text:** Large, readable text
- **File Size:** < 300KB

---

## 6. Troubleshooting

### Logo Not Appearing?
```powershell
# Clear Next.js cache
rm -rf .next
npm run dev

# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Favicon Not Updating?
```powershell
# Clear browser cache completely
# Or use incognito/private window
```

### Changes Not Reflecting?
1. Check Sanity Studio - is document **Published** (not just saved as draft)?
2. Check browser console for errors (F12 → Console tab)
3. Restart development server (`npm run dev`)

### Images Not Loading?
1. Verify image uploaded successfully in Sanity Studio
2. Check image URL in browser network tab (F12 → Network)
3. Ensure Sanity CDN is accessible (no firewall blocking)

---

## 7. Advanced: Custom Logo Styling

If you want to customize logo appearance, edit `components/layout/Navbar.tsx`:

```tsx
// Change logo size
<div className="relative w-10 h-10 lg:w-12 lg:h-12">
  // Increase to w-14 h-14 lg:w-16 lg:h-16 for larger logo
</div>

// Add hover effects
<Image
  className="object-contain hover:scale-110 transition-transform"
  // ... other props
/>

// Hide site name, show only logo
{siteSettings?.logo?.asset && (
  <div className="relative w-32 h-12">
    <Image ... />
  </div>
  // Remove the <span> with site name
)}
```

---

## 8. Next Steps After Setup

Once site settings are populated:

- [ ] **Test all pages** - Logo should appear consistently
- [ ] **Test mobile** - Logo should be responsive
- [ ] **Test social sharing** - Share a link on Facebook/Twitter to see OG image
- [ ] **Update README** - Add logo to repository README.md
- [ ] **Create brand assets folder** - Store logo variations (light/dark, different sizes)
- [ ] **Setup favicons** - Generate multiple sizes (16x16, 32x32, 180x180 for Apple)

---

## 9. Quick Reference: Asset Sizes

| Asset | Recommended Size | Format | Max File Size |
|-------|-----------------|--------|---------------|
| Logo | 500x500px | SVG/PNG | 100KB |
| Favicon | 32x32px | ICO/PNG | 10KB |
| OG Image | 1200x630px | JPG/PNG | 300KB |
| Apple Touch Icon | 180x180px | PNG | 50KB |

---

## Need Help?

If you encounter issues:
1. Check Sanity Studio documentation: https://www.sanity.io/docs
2. Review `SECURITY_IMPLEMENTATION.md` for related setup
3. Check browser console for JavaScript errors
4. Verify `.env.local` has correct Sanity credentials

---

**Last Updated:** January 26, 2026
**Status:** Ready to populate ✅
