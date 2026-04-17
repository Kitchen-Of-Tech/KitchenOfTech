# Client Company Logo Slider Setup Guide

## Overview
A responsive client logo slider has been added to your home page. Clients can upload their logos directly through Sanity CMS and manage their display.

## Features
✅ **Interactive Slider** - Navigation arrows to browse through client logos  
✅ **Responsive Grid** - 2 columns on mobile, 4 columns on desktop  
✅ **Pagination Dots** - Quick navigation to any client  
✅ **Featured Toggle** - Control which logos appear on the homepage  
✅ **Website Links** - Optional clickable links to client websites  
✅ **Automatic Display** - Logos only show if marked as featured  

## How to Add Client Logos in Sanity

### Step 1: Access Sanity Studio
1. Go to your Sanity Studio at `/studio`
2. Look for **"Client Logos"** in the left sidebar (under Content section)

### Step 2: Create a New Client Logo Entry
Click **"Create"** button and select **"Client Logos"**

### Step 3: Fill in the Required Information

**Client Name** (Required)
- Enter the company name, e.g., "Google", "Microsoft", "Apple"

**Logo** (Required)
- Upload the company logo image
- Best format: PNG with transparent background (for better appearance)
- Recommended size: 300x150px or higher
- File size: Keep under 500KB

**Client Website URL** (Optional)
- Enter the company website, e.g., `https://www.google.com`
- Logos with URLs become clickable links
- Users can click to visit the client's website

**Featured** (Required)
- Toggle **ON** to display the logo on the home page slider
- Toggle **OFF** to hide it from the slider
- Default: **ON** (all new logos are featured by default)

**Display Order** (Optional)
- Set a number to control the slider order
- Lower numbers appear first
- Default: 0

### Step 4: Save and Publish
- Click **"Save"** to save changes
- Click **"Publish"** to make it live on the website

## Managing Client Logos

### Edit an Existing Logo
1. Navigate to **"Client Logos"** in Sanity
2. Click on the logo entry you want to edit
3. Make your changes
4. Click **"Save"** and **"Publish"**

### Delete a Logo
1. Click on the logo entry
2. Click the **"Delete"** button (trash icon)
3. Confirm the deletion
4. The logo will be removed from the slider

### Hide a Logo (Without Deleting)
1. Click on the logo entry
2. Toggle **"Featured"** to **OFF**
3. Click **"Save"** and **"Publish"**
4. The logo will be hidden from the slider but remain in the database

### Reorder Logos
1. Update the **"Display Order"** number for logos
2. Logos with lower numbers appear first
3. If multiple logos have the same order number, they're sorted by creation date

## Frontend Display Details

### Home Page Location
- The client logo slider appears after the Services Grid
- Before the Testimonials section
- Section title: **"Trusted by Industry Leaders"**
- Subtitle: **"Join hundreds of satisfied clients worldwide"**

### Slider Behavior
- **Desktop**: Shows 4 logos at once with navigation arrows
- **Mobile**: Shows 2 logos at once, stacked vertically
- **Navigation**: Use arrow buttons to browse or click pagination dots
- **Hover Effects**: Logos change from grayscale to color on hover
- **Links**: Clickable logos open in a new tab

### Logo Styling
- Logos displayed with `grayscale` filter by default
- Hover removes grayscale for better visibility
- Background: Semi-transparent glass effect with subtle border
- Container padding: Ensures proper spacing and responsiveness

## API & Technical Details

### Sanity Query
```groq
*[_type == "clientLogo"] | order(order asc) {
  _id,
  name,
  logo,
  website,
  featured,
  order
}
```

### Component Location
`/components/landing/BrandLogoBar.tsx`

### Required Fields in Database
- `_id`: Unique identifier (auto-generated)
- `name`: Client company name (string)
- `logo`: Logo image (Sanity image)
- `website`: Optional company URL (string/URL)
- `featured`: Display toggle (boolean)
- `order`: Display order (number)

## Troubleshooting

### Logos Not Appearing
**Issue**: Added logos but they don't show on the home page

**Solution**:
1. Ensure **"Featured"** toggle is **ON**
2. Verify the logo image was uploaded successfully
3. Check that at least one logo is marked as featured
4. Rebuild/redeploy the website (changes appear within 30 minutes due to caching)

### Logo Image Quality Issues
**Issue**: Logo appears blurry or stretched

**Solution**:
1. Use PNG format with transparent background
2. Ensure original image is at least 300x150px
3. Use proper aspect ratio (width should be 2x the height)
4. Optimize image size (compress if over 500KB)

### Slider Not Responsive on Mobile
**Issue**: Slider layout looks broken on mobile devices

**Solution**:
1. Check that logo images are properly uploaded
2. Clear browser cache (Ctrl+Shift+Delete)
3. Test in mobile view (F12 → Device Toolbar)
4. Ensure at least 2 logos are featured for proper display

### Logo Links Not Working
**Issue**: Clicking logo doesn't navigate to website

**Solution**:
1. Verify **"Client Website URL"** is filled in correctly
2. Ensure URL includes `https://` protocol
3. Test the URL in a browser to confirm it's valid
4. Republish the changes

## Example Client Logo Entry

| Field | Value |
|-------|-------|
| Client Name | Tech Solutions Inc. |
| Logo | [Upload PNG image] |
| Client Website URL | https://www.techsolutions.com |
| Featured | ✓ ON |
| Display Order | 1 |

## Performance Notes

- Logos are cached for 30 minutes on the homepage
- Images are optimized automatically by Next.js Image component
- Only logos marked as "featured" are fetched and displayed
- Lazy loading ensures fast page load times

## Contact & Support

For questions about the client logo slider or Sanity integration, refer to:
- Component: `/components/landing/BrandLogoBar.tsx`
- Schema: `/sanity/schemas/clientLogo.ts`
- Queries: `/lib/sanity/queries.ts` (CLIENT_LOGOS_QUERY)
