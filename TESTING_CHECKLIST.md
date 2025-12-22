# Multi-Language Support Testing Checklist

## Overview
This checklist verifies that the multi-language implementation (English, French, Arabic) works correctly with zero impact on existing functionality.

## Pre-Testing Setup

- [ ] Clear browser localStorage to test default behavior
- [ ] Open browser DevTools (Console, Network, Application tabs)
- [ ] Ensure backend is running and accessible

---

## 1. Language Switching & Persistence

### 1.1 Initial Load
- [ ] Open application - should default to English if no locale saved
- [ ] Check localStorage - should have `app-locale` key set to 'en' (or saved value)
- [ ] Verify no console errors on initial load

### 1.2 Language Switching
- [ ] Click language dropdown in navbar
- [ ] Switch to French - verify UI updates immediately
- [ ] Check localStorage - `app-locale` should be 'fr'
- [ ] Refresh page - should remain in French
- [ ] Switch to Arabic - verify UI updates immediately
- [ ] Check localStorage - `app-locale` should be 'ar'
- [ ] Refresh page - should remain in Arabic
- [ ] Switch back to English - verify UI updates immediately
- [ ] Refresh page - should remain in English

### 1.3 Persistence Testing
- [ ] Set language to French, close browser completely
- [ ] Reopen browser and navigate to app - should load in French
- [ ] Set language to Arabic, close browser completely
- [ ] Reopen browser and navigate to app - should load in Arabic
- [ ] Clear localStorage manually - should default to English

---

## 2. RTL Layout Testing (Arabic)

### 2.1 Layout Direction
- [ ] Switch to Arabic
- [ ] Check `document.documentElement.getAttribute('dir')` - should be 'rtl'
- [ ] Check `document.body.classList.contains('rtl')` - should be true
- [ ] Verify text alignment is right-aligned
- [ ] Verify overall layout direction is reversed

### 2.2 POS Screens RTL
- [ ] Navigate to POS Item Selection screen
- [ ] Verify cart section appears on left side
- [ ] Verify items grid appears on right side
- [ ] Check button icons are on correct side
- [ ] Verify input groups are reversed
- [ ] Check breadcrumb navigation direction
- [ ] Navigate to Payment screen
- [ ] Verify payment cards layout is RTL
- [ ] Check summary panels alignment
- [ ] Navigate to Return Products screen
- [ ] Verify form layouts are RTL
- [ ] Navigate to Customer Management
- [ ] Verify table alignment is right-aligned

### 2.3 Admin Screens RTL
- [ ] Navigate to Session Dashboard
- [ ] Verify card layouts are RTL
- [ ] Check table alignment
- [ ] Navigate to Tickets History
- [ ] Verify filter panels are RTL
- [ ] Check modal layouts
- [ ] Navigate to other admin screens
- [ ] Verify consistent RTL behavior

### 2.4 Component RTL
- [ ] Check modals - close button should be on left
- [ ] Check cards - headers should be reversed
- [ ] Check buttons with icons - icons on correct side
- [ ] Check input groups - prepend/append reversed
- [ ] Check navigation menus - proper RTL alignment

### 2.5 Switch Back to LTR
- [ ] Switch from Arabic to English/French
- [ ] Verify `dir` attribute changes to 'ltr'
- [ ] Verify `rtl` class removed from body
- [ ] Verify layout returns to normal LTR

---

## 3. Translation Coverage

### 3.1 POS Screens
- [ ] **OpenSession.vue**
  - [ ] Title translated
  - [ ] Form labels translated
  - [ ] Buttons translated
  - [ ] Messages translated

- [ ] **ItemSelection.vue**
  - [ ] Search placeholders translated
  - [ ] Button labels translated
  - [ ] Cart labels translated
  - [ ] Modal titles translated
  - [ ] Status messages translated

- [ ] **Payment.vue**
  - [ ] Payment method labels translated
  - [ ] Form fields translated
  - [ ] Summary labels translated
  - [ ] Buttons translated

- [ ] **ReturnProducts.vue**
  - [ ] Form labels translated
  - [ ] Table headers translated
  - [ ] Buttons translated
  - [ ] Messages translated

- [ ] **CustomerManagement.vue**
  - [ ] Search placeholder translated
  - [ ] Table headers translated
  - [ ] Form labels translated
  - [ ] Buttons translated

### 3.2 Admin Screens
- [ ] **SessionDashboard.vue**
  - [ ] Page title translated
  - [ ] Card labels translated
  - [ ] Modal titles translated
  - [ ] Status labels translated

- [ ] **TicketsHistory.vue**
  - [ ] Page title translated
  - [ ] Filter labels translated
  - [ ] Table headers translated
  - [ ] Modal titles translated

- [ ] **SessionHistory.vue**
  - [ ] Page title translated
  - [ ] Filter labels translated
  - [ ] Table headers translated

- [ ] **ItemSubFamiliesManagement.vue**
  - [ ] Page title translated
  - [ ] Form labels translated
  - [ ] Buttons translated

- [ ] **ItemBarcodes.vue**
  - [ ] Page title translated
  - [ ] Filter labels translated
  - [ ] Table headers translated

### 3.3 Navigation
- [ ] Menu items translated
- [ ] Breadcrumbs translated
- [ ] Page titles translated

### 3.4 Common Components
- [ ] Buttons (Save, Cancel, Delete, etc.) translated
- [ ] Form labels translated
- [ ] Status messages translated
- [ ] Toast notifications translated

---

## 4. Functional Testing

### 4.1 POS Workflow (English)
- [ ] Open session - verify all text in English
- [ ] Add items to cart - verify labels in English
- [ ] Process payment - verify all text in English
- [ ] Complete transaction - verify success message in English

### 4.2 POS Workflow (French)
- [ ] Switch to French
- [ ] Open session - verify all text in French
- [ ] Add items to cart - verify labels in French
- [ ] Process payment - verify all text in French
- [ ] Complete transaction - verify success message in French

### 4.3 POS Workflow (Arabic)
- [ ] Switch to Arabic
- [ ] Open session - verify all text in Arabic + RTL layout
- [ ] Add items to cart - verify labels in Arabic + RTL
- [ ] Process payment - verify all text in Arabic + RTL
- [ ] Complete transaction - verify success message in Arabic

### 4.4 Admin Workflow
- [ ] Navigate to admin screens in each language
- [ ] Verify filters work correctly
- [ ] Verify search works correctly
- [ ] Verify forms work correctly
- [ ] Verify data displays correctly

---

## 5. Error Handling & Fallbacks

### 5.1 Missing Translations
- [ ] Check console for missing translation warnings
- [ ] Verify fallback to English if translation missing
- [ ] Verify no broken UI elements

### 5.2 Invalid Locale
- [ ] Manually set localStorage to invalid value (e.g., 'xx')
- [ ] Refresh page - should default to English
- [ ] Verify no errors in console

### 5.3 Backend Errors
- [ ] Trigger a backend error (e.g., network error)
- [ ] Verify error messages remain in English (as per requirement)
- [ ] Verify UI doesn't break

---

## 6. Performance Testing

### 6.1 Load Performance
- [ ] Initial page load time acceptable
- [ ] Language switching is instant (no delay)
- [ ] No memory leaks when switching languages

### 6.2 Bundle Size
- [ ] Check if translation files are loaded correctly
- [ ] Verify no unnecessary re-renders on language switch

---

## 7. Browser Compatibility

### 7.1 Chrome/Edge
- [ ] Test all features in Chrome
- [ ] Test all features in Edge

### 7.2 Firefox
- [ ] Test all features in Firefox

### 7.3 Safari (if available)
- [ ] Test all features in Safari

---

## 8. Regression Testing

### 8.1 Existing Functionality
- [ ] All POS operations work as before
- [ ] All admin operations work as before
- [ ] No broken features
- [ ] No console errors
- [ ] No visual regressions (except intentional RTL changes)

### 8.2 Data Integrity
- [ ] All data displays correctly
- [ ] Calculations are correct
- [ ] Forms submit correctly
- [ ] API calls work correctly

---

## 9. Edge Cases

### 9.1 Rapid Language Switching
- [ ] Switch languages rapidly (5+ times quickly)
- [ ] Verify no errors
- [ ] Verify UI updates correctly each time

### 9.2 Language Switch During Operation
- [ ] Start a transaction in English
- [ ] Switch to French mid-operation
- [ ] Verify operation continues correctly
- [ ] Verify UI updates correctly

### 9.3 Multiple Tabs
- [ ] Open app in two tabs
- [ ] Change language in one tab
- [ ] Verify other tab doesn't auto-update (expected behavior)
- [ ] Refresh other tab - should use saved locale

---

## 10. Documentation Verification

### 10.1 Code Comments
- [ ] Key i18n implementation points are commented
- [ ] RTL implementation is documented

### 10.2 Translation Files
- [ ] All translation files are valid JSON
- [ ] No syntax errors in translation files
- [ ] Translation keys are consistent across languages

---

## Test Results Summary

**Date:** _______________
**Tester:** _______________
**Environment:** _______________

### Overall Status
- [ ] ✅ All tests passed
- [ ] ⚠️ Some issues found (see notes below)
- [ ] ❌ Critical issues found

### Issues Found
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Notes
_________________________________________________
_________________________________________________
_________________________________________________

---

## Quick Test Script

For quick verification, run through these critical paths:

1. **Language Persistence:**
   ```
   - Switch to French → Refresh → Should stay French
   - Switch to Arabic → Refresh → Should stay Arabic
   - Clear localStorage → Refresh → Should default to English
   ```

2. **RTL Layout:**
   ```
   - Switch to Arabic → Check dir="rtl" on html element
   - Navigate to POS → Verify layout is reversed
   - Switch to English → Verify layout returns to normal
   ```

3. **Translation Coverage:**
   ```
   - Switch to French → Navigate through all POS screens → Verify French text
   - Switch to Arabic → Navigate through all POS screens → Verify Arabic text + RTL
   ```

4. **Functional:**
   ```
   - Complete a full POS transaction in each language
   - Verify no errors and all text is translated
   ```

