# Universal Data Layer (UDL) v2.0.0

## GA4 Schema Compliant | All Platforms | GTM Custom HTML Ready

---

## Quick Setup

1. **Google Tag Manager** → Tags → New → Custom HTML
2. **Paste** the entire content of `universal-datalayer.html`
3. **Trigger**: All Pages
4. **Save & Publish**

---

## Supported Platforms

| Platform | Auto-Detection | Form Tracking | Ecommerce |
|----------|---------------|---------------|-----------|
| WordPress | ✅ | ✅ | ✅ (WooCommerce) |
| Shopify | ✅ | ✅ | ✅ (Full) |
| Laravel | ✅ | ✅ | ✅ (JSON-LD) |
| Wix | ✅ | ✅ | ✅ (JSON-LD) |
| Squarespace | ✅ | ✅ | ✅ (JSON-LD) |
| Framer | ✅ | ✅ | - |
| Webflow | ✅ | ✅ | ✅ (JSON-LD) |
| Custom Sites | ✅ | ✅ | ✅ (JSON-LD) |

---

## Features

### 1. Customer Info Collection
- Auto-detects user data from forms, meta tags, platform objects
- Stores in cookies for cross-page persistence
- Privacy-compliant (hashed for matching)

### 2. Event Match Quality Score (0-100)
- **Email** (25pts) + **Phone** (20pts) + **Name** (15pts)
- **User ID** (15pts) + **Address** (10pts) + **Consent** (10pts) + **Engagement** (5pts)
- Grades: Excellent (80+), Good (60+), Fair (40+), Poor (20+), Minimal (0-19)

### 3. GA4 Standard Events Fired
- `page_view` - every page load
- `scroll` - at 25%, 50%, 75%, 90%, 100%
- `click` - all meaningful clicks
- `cta_click` - call-to-action buttons
- `form_start` - first form interaction
- `form_submit` - form submission
- `generate_lead` - lead form submissions
- `booking_submit` - booking/appointment forms
- `click_to_call` - tel: link clicks
- `click_to_email` - mailto: link clicks
- `file_download` - document downloads
- `outbound_link` - external link clicks
- `view_item` - product page views
- `add_to_cart` - add to cart actions
- `begin_checkout` - checkout start
- `purchase` - completed purchases
- `get_directions` - map link clicks
- `time_on_page` - engagement milestones
- `consent_status` - consent state
- `user_data_ready` - enhanced conversions data

### 4. Cookie Management
- Client ID (390 days)
- Session tracking (30 min timeout)
- First & Last touch attribution
- All click IDs (gclid, fbclid, ttclid, msclkid, etc.)
- User data persistence
- Form interaction flags

### 5. Traffic Source & Attribution
- UTM parameters (full set)
- Click IDs: gclid, gbraid, wbraid, fbclid, ttclid, msclkid, dclid, li_fat_id
- First-touch & Last-touch attribution models
- Referrer-based source/medium detection

### 6. Form Tracking (Universal)
- Auto-detects ALL forms on page (even dynamically added)
- Classifies form type: lead, contact, booking, checkout, newsletter, signup, search, etc.
- Extracts user data: email, phone, name, company, address, etc.
- Works with CF7, Gravity Forms, Wix Forms, Webflow Forms, Squarespace Forms, Framer Forms

### 7. Enhanced Conversions
- Auto-collects user data for Google Enhanced Conversions
- Pushes `user_data` object in GA4 format
- Ready for Meta CAPI matching

---

## Manual API (window.UDL)

```javascript
// Set user data manually
UDL.setUser({
  email: 'user@example.com',
  phone: '+1234567890',
  name: 'John Doe',
  user_id: '12345'
});

// Track custom event
UDL.trackEvent('custom_event', {
  custom_param: 'value'
});

// Ecommerce - View Item
UDL.ecommerce.viewItem({
  item_id: 'SKU123',
  item_name: 'Product Name',
  price: 29.99,
  currency: 'USD'
});

// Ecommerce - Add to Cart
UDL.ecommerce.addToCart({
  item_id: 'SKU123',
  item_name: 'Product Name',
  price: 29.99,
  currency: 'USD'
}, 2);

// Ecommerce - Purchase
UDL.ecommerce.purchase({
  id: 'TXN-001',
  value: 89.97,
  currency: 'USD',
  tax: 5.00,
  shipping: 10.00,
  items: [{item_id: 'SKU123', item_name: 'Product', price: 29.99, quantity: 3}]
});

// Generate Lead
UDL.ecommerce.generateLead({
  value: 100,
  source: 'landing_page',
  type: 'consultation'
});

// Book Appointment
UDL.ecommerce.bookAppointment({
  type: 'consultation',
  date: '2025-03-15',
  time: '10:00',
  service: 'Hair Cut',
  value: 50
});

// Get Quality Score
console.log(UDL.getQualityScore());
// { score: 75, grade: 'good' }

// Get Attribution
console.log(UDL.getAttribution());

// Enable Debug Mode
UDL.debug(true);
```

---

## Data Layer Variables in GTM

Create these **Data Layer Variables** in GTM to use the pushed data:

| Variable Name | Data Layer Variable |
|---------------|-------------------|
| DLV - Event Match Quality | `event_match_quality` |
| DLV - Session ID | `session_id` |
| DLV - Client ID | `client_id` |
| DLV - User ID | `user_id` |
| DLV - Page Type | `page_type` |
| DLV - Content Group | `content_group` |
| DLV - Platform | `platform_detected` |
| DLV - Traffic Source | `traffic_source` |
| DLV - Traffic Medium | `traffic_medium` |
| DLV - GCLID | `gclid` |
| DLV - FBCLID | `fbclid` |
| DLV - Form ID | `form_id` |
| DLV - Form Type | `form_type` |
| DLV - Lead Source | `lead_source` |
| DLV - User Data | `user_data` |
| DLV - Ecommerce Items | `ecommerce.items` |
| DLV - Ecommerce Value | `ecommerce.value` |
| DLV - Transaction ID | `ecommerce.transaction_id` |

---

## Industry Use Cases

### Ecommerce (Shopify/WooCommerce)
- Auto-tracks product views, add to cart, checkout, purchase
- Full ecommerce funnel with GA4 items array

### Local Services (Restaurants, Salons, Clinics)
- Tracks click-to-call, get directions, booking forms
- Local business schema detection

### SaaS / Lead Gen
- Form tracking with lead scoring
- Demo request, trial signup, contact form detection

### Real Estate
- Property inquiry tracking
- Booking viewing appointments

### Healthcare / Legal / Financial
- Appointment booking tracking
- Consultation request forms
- Service area detection

---

## Privacy & Compliance

- Respects consent from: Cookiebot, OneTrust, CookieYes, TCF v2
- Hashes PII before pushing to data layer
- Cookie prefix `_udl_` for easy identification
- SameSite=Lax; Secure flags on all cookies
- No data sent to external servers (data stays in dataLayer)
