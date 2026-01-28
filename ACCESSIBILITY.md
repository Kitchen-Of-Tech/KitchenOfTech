# Accessibility Guidelines

Kitchen of Tech is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

## Conformance Status

We are working towards **WCAG 2.1 Level AA** conformance. The Web Content Accessibility Guidelines (WCAG) define requirements to make web content more accessible to people with disabilities.

## Testing

### Automated Testing

We use multiple tools to ensure accessibility:

1. **@axe-core/playwright** - Automated accessibility testing in E2E tests
2. **Lighthouse** - Comprehensive audits including accessibility scores
3. **TypeScript** - Type safety to prevent common errors

### Manual Testing

We regularly test with:

- **Keyboard Navigation** - All functionality accessible without mouse
- **Screen Readers** - NVDA, JAWS, VoiceOver compatibility
- **Color Contrast** - Minimum WCAG AA ratios (4.5:1 for normal text, 3:1 for large text)
- **Zoom** - Content readable at 200% zoom
- **High Contrast Mode** - Works with Windows/macOS high contrast settings

## Accessibility Features

### Keyboard Navigation

- ✅ All interactive elements are keyboard accessible
- ✅ Tab order follows logical page flow
- ✅ No keyboard traps
- ✅ Skip to main content link for keyboard users
- ✅ Visible focus indicators on all interactive elements
- ✅ Modal dialogs trap focus appropriately
- ✅ Escape key closes modals and dropdowns

### Screen Reader Support

- ✅ Semantic HTML structure (header, nav, main, footer)
- ✅ ARIA landmarks for major page regions
- ✅ ARIA labels on icon-only buttons
- ✅ Form labels properly associated with inputs
- ✅ Error messages announced to screen readers
- ✅ Loading states communicated via aria-live regions
- ✅ Alt text on all images
- ✅ Meaningful link text (no "click here")

### Visual Design

- ✅ Color is not the only means of conveying information
- ✅ Text meets WCAG AA contrast ratios
- ✅ Text can be resized up to 200% without loss of functionality
- ✅ Content reflows on small viewports
- ✅ No horizontal scrolling at 320px width
- ✅ Focus indicators are visible and high contrast

### Forms

- ✅ Labels for all form inputs
- ✅ Required fields indicated with * and aria-required
- ✅ Error messages associated with fields via aria-describedby
- ✅ Inline validation with clear error messages
- ✅ Fieldsets and legends for related inputs
- ✅ Autocomplete attributes for common fields

### Multimedia

- ✅ Images have descriptive alt text
- ✅ Decorative images use empty alt=""
- ✅ Videos have captions (when applicable)
- ✅ Audio content has transcripts (when applicable)
- ✅ No auto-playing media
- ✅ Controls for all media

### Tables

- ✅ Table headers marked with \<th\>
- ✅ Complex tables use scope attributes
- ✅ Caption or aria-label for table purpose
- ✅ No layout tables (CSS Grid/Flexbox instead)

## Running Accessibility Tests

### E2E Accessibility Tests

```powershell
npm run test:e2e -- accessibility.spec.ts
```

This runs automated accessibility scans on all major pages using @axe-core/playwright.

### Lighthouse Audit

```powershell
# First, start the dev server
npm run dev

# In another terminal, run Lighthouse
npm run lighthouse
```

This generates a comprehensive accessibility report for all pages.

### Manual Keyboard Testing Checklist

1. Tab through all interactive elements
2. Verify focus indicators are visible
3. Test all forms can be filled using only keyboard
4. Test all buttons and links work with Enter/Space
5. Test modal dialogs can be closed with Escape
6. Test dropdown menus work with arrow keys
7. Verify no keyboard traps

### Screen Reader Testing Checklist

1. Navigate page with screen reader only
2. Verify all images have alt text
3. Check form labels are announced
4. Verify error messages are read
5. Test landmark navigation
6. Check heading hierarchy makes sense
7. Verify link purpose is clear from context

## Known Issues

We maintain a list of known accessibility issues and track their resolution:

### High Priority
- None currently identified

### Medium Priority
- None currently identified

### Low Priority
- None currently identified

## Reporting Accessibility Issues

We welcome feedback on accessibility. If you encounter an accessibility barrier:

1. Email: accessibility@kitchenoftech.com
2. Subject line: "Accessibility Issue: [Brief Description]"
3. Include:
   - Page URL where issue occurs
   - Description of the issue
   - Assistive technology being used (if applicable)
   - Browser and operating system

We aim to respond within 2 business days.

## Accessibility Statement

Last updated: [Current Date]

### Measures to Support Accessibility

Kitchen of Tech takes the following measures to ensure accessibility:

- Include accessibility throughout our design process
- Provide continual accessibility training for our staff
- Assign clear accessibility goals and responsibilities
- Employ formal accessibility quality assurance methods

### Technical Specifications

Accessibility relies on the following technologies:

- HTML
- WAI-ARIA
- CSS
- JavaScript
- Next.js 16 with App Router
- React 19

These technologies are relied upon for conformance with WCAG 2.1 Level AA.

### Limitations and Alternatives

Despite our best efforts, some limitations may occur:

1. **Third-party Content**: Some embedded content from third parties may not be fully accessible. We provide accessible alternatives where possible.

2. **PDF Documents**: Some older PDF documents may not be fully accessible. Please contact us if you need an alternative format.

3. **Videos**: We are working to add captions to all videos. Please contact us if you need a transcript.

### Compliance Standards

- WCAG 2.1 Level AA
- Section 508
- ADA Title III (where applicable)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Continuous Improvement

We review and update our accessibility practices:

- Monthly automated accessibility scans
- Quarterly manual audits
- Annual comprehensive third-party audit
- Ongoing training for development team
- User feedback incorporated into updates

---

**Contact**: If you have questions or need assistance, please email accessibility@kitchenoftech.com or call [phone number] during business hours.
