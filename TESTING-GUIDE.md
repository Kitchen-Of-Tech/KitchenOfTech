# 🧪 Testing Guide - KitchenOfTech

## Manual Performance Testing

Since Lighthouse CLI has permission issues, use **Chrome DevTools** for comprehensive testing:

### Chrome DevTools Lighthouse

1. **Open Chrome**: Navigate to http://localhost:3000
2. **Open DevTools**: Press `F12` or `Ctrl+Shift+I`
3. **Go to Lighthouse tab**
4. **Select categories**:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. **Select Device**: Desktop or Mobile
6. **Click "Analyze page load"**

### Expected Scores (Target: 90+)

| Category | Target | Notes |
|----------|--------|-------|
| **Performance** | 90+ | May be lower with 3D laptop |
| **Accessibility** | 90+ | Alt text, ARIA labels, contrast |
| **Best Practices** | 90+ | HTTPS, console errors, security |
| **SEO** | 90+ | Meta tags, sitemap, robots.txt |

---

## 🌐 Cross-Browser Testing Checklist

### Test URLs
- Homepage: http://localhost:3000
- Services: http://localhost:3000/services
- Blog: http://localhost:3000/blog
- Portfolio: http://localhost:3000/portfolio
- Team: http://localhost:3000/team
- Testimonials: http://localhost:3000/testimonials

---

## Browser Testing Matrix

### ✅ Google Chrome (Latest)

**Version to test:** Chrome 120+

**Test Checklist:**
- [ ] Homepage loads correctly
- [ ] 3D laptop renders and animates smoothly
- [ ] Purple backlight effect visible
- [ ] Floating service text readable
- [ ] Navigation works
- [ ] All page transitions smooth
- [ ] Forms submit correctly
- [ ] Responsive design works (F12 → Device Toolbar)
- [ ] Glass morphism effects render
- [ ] Gradients display correctly

**DevTools Checks:**
- [ ] No console errors (F12 → Console)
- [ ] No 404 errors (F12 → Network)
- [ ] No memory leaks (F12 → Performance)
- [ ] 3D canvas renders at 60fps

---

### 🦊 Mozilla Firefox (Latest)

**Version to test:** Firefox 120+

**Known Compatibility:**
- Three.js fully supported
- WebGL 2.0 supported
- CSS backdrop-filter supported

**Test Checklist:**
- [ ] Homepage loads correctly
- [ ] 3D laptop renders smoothly
- [ ] Glass morphism effects work
- [ ] All animations smooth
- [ ] Navigation functional
- [ ] Forms work correctly
- [ ] Responsive breakpoints correct

**Firefox DevTools:**
- [ ] Check Console (F12)
- [ ] Check Network tab
- [ ] Test 3D rendering (WebGL inspector)

---

### 🧭 Safari (macOS/iOS)

**Version to test:** Safari 16+

**Known Issues to Watch:**
- Backdrop-filter may need `-webkit-` prefix
- Date input styling different
- WebGL context limits

**Test Checklist:**
- [ ] Homepage loads
- [ ] 3D laptop works on macOS
- [ ] 3D laptop works on iOS (may be slower)
- [ ] Glass effects render (check -webkit-backdrop-filter)
- [ ] Touch gestures work on iPad/iPhone
- [ ] Animations smooth on mobile
- [ ] Forms work correctly

**Safari-Specific Checks:**
- [ ] No "WebGL context lost" errors
- [ ] Smooth scrolling works
- [ ] Date pickers styled correctly

---

### 🔷 Microsoft Edge (Latest)

**Version to test:** Edge 120+

**Compatibility:** Same as Chrome (Chromium-based)

**Test Checklist:**
- [ ] All Chrome tests pass
- [ ] Windows-specific rendering correct
- [ ] Touch support works (Surface devices)
- [ ] High DPI displays render correctly

---

## 📱 Mobile Device Testing

### iOS Testing (iPhone)

**Devices to test:**
- iPhone SE (375x667) - Small screen
- iPhone 12/13 (390x844) - Standard
- iPhone 14 Pro Max (430x932) - Large

**Test Points:**
- [ ] 3D laptop loads (may be slower)
- [ ] Touch navigation works
- [ ] Pinch zoom disabled where needed
- [ ] Buttons large enough (44x44 min)
- [ ] Forms keyboard friendly
- [ ] No horizontal scroll

---

### Android Testing

**Devices to test:**
- Pixel 5 (393x851)
- Samsung Galaxy S21 (360x800)
- Tablet (768x1024)

**Test Points:**
- [ ] 3D laptop performance acceptable
- [ ] Material Design interactions
- [ ] Back button behavior
- [ ] Forms auto-fill works
- [ ] No layout shift

---

## 🎨 Visual Testing

### Glass Morphism Effects

**Check these elements:**
- [ ] Navbar: Blur effect visible
- [ ] Cards: Transparent background with blur
- [ ] Buttons: Hover effects smooth
- [ ] Modals: Backdrop blur works

**CSS to verify:**
```css
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
background: rgba(255, 255, 255, 0.05);
```

---

### Gradient Effects

**Check these:**
- [ ] Hero title gradient animates
- [ ] Button gradients smooth
- [ ] Background gradients render
- [ ] Purple/blue theme consistent

---

### 3D Laptop Visual Check

**Verify:**
- [ ] Laptop model loads completely
- [ ] Materials/textures applied correctly
- [ ] Purple backlight glows properly
- [ ] Floating text positioned correctly
- [ ] No z-fighting or artifacts
- [ ] Smooth rotation animation
- [ ] Proper scale (not too big/small)

---

## ⚡ Performance Testing

### Core Web Vitals

**Use Chrome DevTools → Performance**

**Metrics to check:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Test on:**
- [ ] Fast 3G
- [ ] Slow 3G
- [ ] Desktop
- [ ] Mobile

---

### 3D Performance

**Monitor FPS (Frames Per Second):**
- Target: 60fps
- Minimum acceptable: 30fps

**Chrome DevTools → Performance:**
1. Click Record
2. Interact with 3D laptop
3. Stop recording
4. Check FPS chart

**Expected:**
- Desktop: 55-60 fps
- Mobile: 30-45 fps

---

## 🔒 Security Testing

### HTTPS Check
- [ ] Site uses HTTPS (production)
- [ ] No mixed content warnings
- [ ] Valid SSL certificate

### Content Security Policy
- [ ] No XSS vulnerabilities
- [ ] External scripts from trusted sources
- [ ] CORS configured correctly

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Skip links work
- [ ] Focus visible on all elements
- [ ] No keyboard traps

### Screen Reader
- [ ] Install NVDA (Windows) or VoiceOver (Mac)
- [ ] Test page navigation
- [ ] Verify alt text on images
- [ ] Check ARIA labels

### Color Contrast
- [ ] Text readable against backgrounds
- [ ] Button text meets WCAG AA (4.5:1)
- [ ] Important info not color-only

**Tools:**
- Chrome DevTools → Lighthouse → Accessibility
- axe DevTools extension
- WAVE browser extension

---

## 📊 Results Template

Copy and fill out after testing:

```
## Testing Results - [Date]

### Chrome
- Performance: __/100
- Accessibility: __/100
- Best Practices: __/100
- SEO: __/100
- Issues found: 
  - 
  - 

### Firefox
- 3D Laptop: ✅/❌
- Glass Effects: ✅/❌
- Navigation: ✅/❌
- Issues: 

### Safari
- Desktop: ✅/❌
- iOS: ✅/❌
- Issues:

### Edge
- Rendering: ✅/❌
- Issues:

### Mobile
- iOS: ✅/❌
- Android: ✅/❌
- Performance: ✅/❌

### Critical Issues
1. 
2. 
3. 

### Minor Issues
1. 
2. 

### Performance Metrics
- LCP: __s
- FID: __ms
- CLS: __
- 3D FPS: __

### Recommendations
1. 
2. 
```

---

## 🐛 Common Issues & Fixes

### 3D Laptop Not Loading
**Symptoms:** Black screen or nothing
**Check:**
- Console for errors
- Network tab for 404s on .obj/.mtl files
- WebGL support: chrome://gpu

**Fix:** Verify files in `public/models/obj/`

---

### Glass Effects Not Working
**Symptoms:** No blur, solid backgrounds
**Check:** Safari needs `-webkit-backdrop-filter`
**Fix:** Add prefix in CSS

---

### Slow Performance
**Symptoms:** Choppy animations, low FPS
**Check:** 
- Disable 3D temporarily
- Check CPU usage
**Fix:** Already optimized (shadows off, low poly)

---

### Forms Not Submitting
**Symptoms:** Button doesn't work
**Check:** 
- Console for Supabase errors
- Network tab for API calls
**Fix:** Verify environment variables

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] All browsers tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive on 3+ devices
- [ ] No console errors
- [ ] Lighthouse scores 90+ (or documented reason)
- [ ] 3D laptop works smoothly
- [ ] Forms submit successfully
- [ ] All images have alt text
- [ ] SEO meta tags present
- [ ] No broken links
- [ ] Analytics tracking works

---

## 🚀 Quick Test Commands

```bash
# Start production server
npm start

# Open in default browser (Windows)
start http://localhost:3000

# Test mobile viewport (Chrome)
# Press F12 → Toggle device toolbar (Ctrl+Shift+M)

# Check for console errors
# F12 → Console tab

# Test performance
# F12 → Lighthouse → Analyze
```

---

## 📞 Testing Support

**Browser DevTools:**
- Chrome: F12 or Ctrl+Shift+I
- Firefox: F12
- Safari: Cmd+Option+I (enable first in prefs)
- Edge: F12

**Mobile Testing:**
- Chrome Remote Debugging
- Safari Web Inspector (iOS)
- BrowserStack (cloud testing)

---

**Status:** Ready for manual testing  
**Priority:** Test Chrome first, then Firefox, Safari, Edge  
**Estimated Time:** 30-60 minutes for complete testing

---

*Follow this guide to ensure your site works perfectly across all browsers!* 🎯
