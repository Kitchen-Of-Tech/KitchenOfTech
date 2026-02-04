# Contact Page Setup Guide

The contact page is now **fully dynamic** and fetches all content from Sanity CMS. This means you can update all text, images, links, and settings without touching any code!

## 🎯 What's Now Dynamic?

✅ **Hero Section**
- Badge text
- Title
- Description

✅ **Contact Information Cards**
- Email, Phone, Location, Hours
- Icons, titles, values, links, descriptions
- Fully customizable - add/remove cards

✅ **Contact Form Settings**
- Form title
- Form description
- Success message
- Submit button text

✅ **Why Choose Us Section**
- Section title
- List of features/benefits
- Each item has title and description

✅ **Social Media Links**
- Platform (LinkedIn, Facebook, Twitter, Instagram, GitHub, YouTube)
- URLs
- Labels
- Icons are automatically mapped

✅ **Inspirational Quote**
- Quote text
- Author name

✅ **Map Settings**
- Enable/disable map
- Google Maps embed URL
- Placeholder text when map is not configured

## 🚀 How to Set Up in Sanity Studio

### Step 1: Access Sanity Studio

1. Run your Sanity Studio:
   ```bash
   npm run dev
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000/studio
   ```

3. Look for **"Contact Page"** in the left sidebar

### Step 2: Create Contact Page Content

Click on "Contact Page" and fill in the following sections:

#### 📝 Hero Section
```
Badge: Get In Touch
Title: Let's Start a Conversation
Description: Have a project in mind? We'd love to hear about it. Drop us a message and we'll get back to you as soon as possible.
```

#### 📧 Contact Information Cards

Add 4 cards with these details:

**Card 1 - Email:**
- Icon: `mail`
- Title: Email Us
- Value: hello@kitchenoftech.org
- Link: mailto:hello@kitchenoftech.org
- Description: Send us an email anytime

**Card 2 - Phone:**
- Icon: `phone`
- Title: Call Us
- Value: +1 (555) 123-4567
- Link: tel:+15551234567
- Description: Mon-Fri from 9am to 6pm

**Card 3 - Location:**
- Icon: `mapPin`
- Title: Visit Us
- Value: San Francisco, CA
- Link: https://maps.google.com
- Description: Come say hello at our office

**Card 4 - Hours:**
- Icon: `clock`
- Title: Working Hours
- Value: 9:00 AM - 6:00 PM
- Link: (leave empty)
- Description: Monday to Friday

#### 📋 Form Settings
```
Title: Send us a Message
Description: Fill out the form below and we'll get back to you within 24 hours.
Success Message: Thank you! Your message has been sent successfully. We'll get back to you soon.
Submit Button Text: Send Message
```

#### ✨ Why Choose Us Section
```
Title: Why Choose Us?

Items:
1. Title: Fast Response
   Description: 24-hour response time

2. Title: Expert Team
   Description: 10+ years of experience

3. Title: Quality Work
   Description: 100% satisfaction guaranteed

4. Title: Ongoing Support
   Description: We're here when you need us
```

#### 🌐 Social Media Links

Add your social media accounts:

```
- Platform: linkedin
  URL: https://linkedin.com/company/yourcompany
  Label: LinkedIn

- Platform: facebook
  URL: https://facebook.com/yourpage
  Label: Facebook

- Platform: twitter
  URL: https://twitter.com/youraccount
  Label: Twitter

- Platform: instagram
  URL: https://instagram.com/youraccount
  Label: Instagram

- Platform: github
  URL: https://github.com/youraccount
  Label: GitHub
```

#### 💬 Inspirational Quote
```
Text: Great things in business are never done by one person. They're done by a team of people.
Author: Steve Jobs
```

#### 🗺️ Map Settings
```
Show Map: Yes/No (toggle)
Google Maps Embed URL: (paste your Google Maps embed URL)
Placeholder Text: Map Coming Soon
```

### Step 3: How to Get Google Maps Embed URL

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for your location
3. Click "Share" button
4. Click "Embed a map" tab
5. Copy the URL from the `src=""` attribute in the iframe code
6. Paste it into the "Google Maps Embed URL" field in Sanity

Example:
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3...
```

### Step 4: Save and Publish

1. Click **"Publish"** button in the top right corner
2. Your contact page will automatically update with the new content!

## 🎨 Customization Tips

### Adding More Contact Info Cards

You can add as many contact information cards as you need:
- Support Email
- Sales Phone
- Technical Support
- Regional Offices
- etc.

The layout will automatically adjust!

### Changing Icons

Available icons for contact cards:
- `mail` - Email icon
- `phone` - Phone icon
- `mapPin` - Location pin
- `clock` - Clock/hours icon

### Changing Social Platforms

Available social media platforms:
- `linkedin` - LinkedIn (blue)
- `facebook` - Facebook (blue)
- `twitter` - Twitter (sky blue)
- `instagram` - Instagram (pink)
- `github` - GitHub (gray)
- `youtube` - YouTube (red)

## 🔄 Fallback Content

If you haven't set up the content in Sanity yet, the page will display default placeholder content, so your site won't break!

## 📱 Responsive Design

The contact page is fully responsive and works beautifully on:
- Desktop computers
- Tablets
- Mobile phones

## 🎭 Features

✨ **Glass Morphism Design** - Modern glassmorphic cards with blur effects
🎬 **Framer Motion Animations** - Smooth entrance and scroll animations
🎨 **Gradient Backgrounds** - Animated gradient backgrounds
📧 **Form Validation** - Built-in form validation
✅ **Success States** - Visual feedback on form submission
🌐 **Social Media Integration** - Clickable social media icons
🗺️ **Google Maps** - Optional map integration
💬 **Inspirational Quote** - Motivational quote section

## 🛠️ Technical Details

**Schema Location:** `sanity/schemas/contactPage.ts`
**Page Component:** `app/contact/page.tsx`
**Query:** `CONTACT_PAGE_QUERY` in `lib/sanity/queries.ts`

The page uses:
- Client-side rendering (`'use client'`)
- React hooks (useState, useEffect)
- Sanity client for data fetching
- Fallback content for missing data
- TypeScript for type safety

## 🚨 Important Notes

1. **Only ONE contact page document** should exist in Sanity
2. The page fetches data on client-side, so it loads fast
3. Loading state shows "Loading..." while fetching
4. All fields are optional - the page won't break if fields are empty
5. The contact form currently simulates submission - you can integrate with your backend API

## 📞 Need Help?

If you need assistance setting up the contact page in Sanity:
1. Make sure Sanity Studio is running
2. Check that the schema is imported correctly
3. Verify your Sanity project ID and dataset in `.env.local`
4. Clear your browser cache if changes don't appear

Happy editing! 🎉
