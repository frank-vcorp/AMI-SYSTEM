# 🧪 E2E TESTING PLAN: MOD-CITAS → MOD-EXPEDIENTES Integration

**Phase:** 1.3 (MOD-CITAS Integration)  
**Created:** 2026-01-23  
**Ready for Testing:** ✅ YES - All components wired correctly  

---

## 📋 Overview

End-to-end testing plan for the new "Generar Expediente" flow that connects appointments to medical records creation. This validates the complete data flow from appointment check-in to expedient initialization.

---

## ✅ Code Verification Results

### Component Chain Verification
```
AppointmentTable
├── ✅ Interface: onCreateExpedient?: (appointmentId, patientId) => void
├── ✅ Destructured in function signature
├── ✅ Button rendered conditionally for CHECK_IN status
├── ✅ onClick calls onCreateExpedient with correct params
└── ✅ Type-safe callback pattern

AppointmentManager
├── ✅ Imported useRouter from next/navigation
├── ✅ handleCreateExpedient function defined
├── ✅ Navigation URL correct: /admin/expedientes/new?appointmentId={id}&patientId={id}
├── ✅ Callback passed to AppointmentTable
└── ✅ No TypeScript errors

NewExpedientPage (/admin/expedientes/new)
├── ✅ Wrapped in Suspense for useSearchParams safety
├── ✅ Query params read correctly
├── ✅ ExpedientForm receives appointmentId and patientId props
├── ✅ onSuccess callback navigates to detail page
└── ✅ onError callback shows alert

ExpedientForm
├── ✅ Already supports appointmentId and patientId props
├── ✅ Pre-fills form defaultValues from props
├── ✅ Submit includes both fields in payload
└── ✅ No changes needed
```

**Result:** ✅ **ALL COMPONENTS CORRECTLY INTEGRATED**

---

## 🧬 Data Flow Validation

### Happy Path Flow
```
1. Admin at /admin/citas page
   ↓
2. Appointment row visible with status = CHECK_IN
   ↓
3. Admin clicks "📋 Generar Expediente" button
   ↓
4. onClick → onCreateExpedient(appointment.id, appointment.employeeId)
   ↓
5. AppointmentManager.handleCreateExpedient executes
   ↓
6. router.push(`/admin/expedientes/new?appointmentId=${id}&patientId=${id}`)
   ↓
7. Browser navigates to /admin/expedientes/new with query params
   ↓
8. NewExpedientContent reads searchParams
   ↓
9. ExpedientForm receives props: appointmentId, patientId
   ↓
10. Form pre-fills: 
    - appointmentId field shows {id}
    - patientId field shows {id}
    ↓
11. Admin fills optional notes
    ↓
12. Admin clicks "Create Expedient"
    ↓
13. Form submits POST /api/expedientes with:
    {
      "appointmentId": "{id}",
      "patientId": "{id}",
      "notes": "{optional}"
    }
    ↓
14. API creates expedient record in database
    ↓
15. onSuccess callback executes
    ↓
16. window.location.href = `/admin/expedientes/{newExpedientId}`
    ↓
17. Browser navigates to detail page
    ↓
18. ✅ FLOW COMPLETE
```

### Data Mapping Validation
```
Source (MOD-CITAS)           Destination (MOD-EXPEDIENTES)
═════════════════════════════════════════════════════════════
appointment.id               → appointmentId (query param)
appointment.employeeId       → patientId (query param)
appointment.status           → CHECK_IN (visibility condition)
                                
appointment record in DB     → linked via appointmentId in expedient
```

---

## 🔍 Test Scenarios

### Scenario 1: Button Visibility
**Precondition:** Appointment list loaded  
**Steps:**
1. View appointment with `status = SCHEDULED`
   - Expected: No "Generar Expediente" button
   - Verify: ✓ Only "Editar" and "Cancelar" buttons visible

2. View appointment with `status = CONFIRMED`
   - Expected: No "Generar Expediente" button
   - Verify: ✓ Only "Editar" and "Cancelar" buttons visible

3. View appointment with `status = CHECK_IN`
   - Expected: "📋 Generar Expediente" button IS visible
   - Verify: ✓ Button appears green, clickable

4. View appointment with `status = COMPLETED`
   - Expected: No "Generar Expediente" button
   - Verify: ✓ No buttons visible (all hidden by CANCELLED check)

**Expected Result:** ✅ Button visibility correct for all statuses

---

### Scenario 2: Navigation & Query Params
**Precondition:** Appointment with CHECK_IN status visible  
**Steps:**
1. Click "📋 Generar Expediente" button
   - Expected: Page navigates to `/admin/expedientes/new`
   - Verify: ✓ URL shows in browser location bar

2. Check URL parameters
   - Expected: `?appointmentId={appointment.id}&patientId={appointment.employeeId}`
   - Verify: ✓ Query string visible in browser URL
   - Note: Browser DevTools > Console > `new URLSearchParams(window.location.search).entries()`

3. Check page load
   - Expected: "Create New Expedient" page loads without errors
   - Verify: ✓ No console errors, page renders
   - Note: Browser DevTools > Console tab

**Expected Result:** ✅ Navigation and URL params correct

---

### Scenario 3: Form Pre-Fill
**Precondition:** Navigated to /admin/expedientes/new with query params  
**Steps:**
1. Load page
   - Expected: Form fields render
   - Verify: ✓ Form visible with 3 input fields

2. Check appointmentId field
   - Expected: Value populated with appointment.id from query params
   - Verify: ✓ Input shows correct ID value
   - Note: Browser DevTools > Inspector > check input value attribute

3. Check patientId field
   - Expected: Value populated with appointment.employeeId from query params
   - Verify: ✓ Input shows correct ID value

4. Check notes field
   - Expected: Empty, ready for user input
   - Verify: ✓ Textarea empty

5. Check form labels
   - Expected: Labels say "Appointment ID", "Patient ID", "Notes (Optional)"
   - Verify: ✓ Labels correct

**Expected Result:** ✅ Form pre-fills correctly from query params

---

### Scenario 4: Form Submission
**Precondition:** Form pre-filled with appointmentId and patientId  
**Steps:**
1. Add notes
   - Expected: User can type in notes textarea
   - Verify: ✓ Textarea accepts input

2. Click "Create Expedient" button
   - Expected: Button disabled, shows "Creating..." state
   - Verify: ✓ Button appears disabled during submission

3. Check API call
   - Expected: POST /api/expedientes with payload:
     ```json
     {
       "appointmentId": "{id}",
       "patientId": "{id}",
       "notes": "{user input}"
     }
     ```
   - Verify: ✓ Browser DevTools > Network tab > inspect POST request
   - Check: Request Headers, Payload, Response

4. Wait for response
   - Expected: API returns 200 with expedient object containing ID
   - Verify: ✓ Response shows expedient.id in JSON

5. Check page redirect
   - Expected: Browser navigates to `/admin/expedientes/{newExpedientId}`
   - Verify: ✓ URL changes, detail page loads

**Expected Result:** ✅ Form submission succeeds, redirects to detail page

---

### Scenario 5: Database Verification
**Precondition:** Expedient created successfully  
**Steps:**
1. Query database
   - Expected: New record in `expedient` table
   - Verify: ✓ SELECT * FROM expedient WHERE id = '{newExpedientId}'

2. Check record values
   - Expected:
     - `appointmentId` = appointment ID from form
     - `patientId` = employee ID from form
     - `status` = PENDING (initial state)
     - `createdAt` = current timestamp
     - `tenantId` = tenant from context
   - Verify: ✓ All fields populated correctly

3. Verify tenant isolation
   - Expected: Record belongs to correct tenant
   - Verify: ✓ tenantId matches current user's tenant

4. Check relations
   - Expected: Can join to appointment table via appointmentId
   - Verify: ✓ SELECT * FROM expedient e JOIN appointment a ON e.appointmentId = a.id

**Expected Result:** ✅ Database record created with correct data and relations

---

### Scenario 6: Error Handling
**Precondition:** Form ready to submit  
**Steps:**
1. Test with invalid appointmentId
   - Expected: API validation fails
   - Verify: ✓ Error alert shows "Appointment not found" or similar

2. Test with invalid patientId
   - Expected: API validation fails
   - Verify: ✓ Error alert shows "Patient not found" or similar

3. Test network error
   - Expected: Error callback fires
   - Verify: ✓ Console shows error, alert displays message

4. Test with empty required fields
   - Expected: Form validation prevents submission
   - Verify: ✓ Red error messages show below fields

**Expected Result:** ✅ All error cases handled gracefully

---

## 📊 Manual Testing Checklist

### Pre-Testing Setup
- [ ] System running locally (`npm run dev`)
- [ ] Database seeded with test appointments
- [ ] At least 1 appointment in CHECK_IN status
- [ ] Browser DevTools available (F12)

### Scenario 1: Button Visibility
- [ ] SCHEDULED appointment: No button visible
- [ ] CONFIRMED appointment: No button visible
- [ ] CHECK_IN appointment: ✓ Button visible and green
- [ ] COMPLETED appointment: No buttons visible

### Scenario 2: Navigation
- [ ] Click button on CHECK_IN appointment
- [ ] URL shows /admin/expedientes/new
- [ ] Query params present in URL bar
- [ ] No console errors

### Scenario 3: Form Pre-Fill
- [ ] appointmentId field populated with correct value
- [ ] patientId field populated with correct value
- [ ] notes field empty and ready for input
- [ ] All labels correct

### Scenario 4: Submission
- [ ] Fill notes field with test data
- [ ] Click "Create Expedient"
- [ ] Button shows "Creating..." state
- [ ] Network tab shows POST to /api/expedientes
- [ ] Response 200 OK with expedient.id
- [ ] Redirects to detail page
- [ ] Detail page shows created expedient

### Scenario 5: Database
- [ ] Query database and verify record exists
- [ ] appointmentId matches in database
- [ ] patientId matches in database
- [ ] status = PENDING
- [ ] tenantId correct

### Scenario 6: Error Cases
- [ ] Modify URL query params to invalid values
- [ ] Submit form with invalid data
- [ ] Disconnect network and try submit
- [ ] Check error messages appear

---

## 🚀 Automated Testing Opportunities

### Unit Tests (Optional - vitest)
```typescript
// packages/mod-citas/src/components/__tests__/AppointmentTable.test.tsx
describe('AppointmentTable - Expedient Button', () => {
  test('renders button only for CHECK_IN appointments', () => {
    // Render component with CHECK_IN appointment
    // Assert button is visible
  });

  test('calls onCreateExpedient with correct params on click', () => {
    // Render with mock callback
    // Click button
    // Assert callback called with (appointmentId, employeeId)
  });
});

// packages/web-app/src/components/__tests__/AppointmentManager.test.tsx
describe('AppointmentManager - Expedient Navigation', () => {
  test('navigates to correct URL with query params', () => {
    // Mock useRouter
    // Call handleCreateExpedient
    // Assert router.push called with correct URL
  });
});
```

### Integration Tests (Optional - playwright)
```typescript
test('e2e: appointment to expedient creation', async ({ page }) => {
  // Navigate to /admin/citas
  // Find CHECK_IN appointment
  // Click "Generar Expediente" button
  // Assert navigated to correct page
  // Assert form pre-filled
  // Fill notes
  // Submit form
  // Assert redirected to detail page
  // Query database and verify record
});
```

---

## ✅ Sign-Off Criteria

### Code Quality
- [x] 0 TypeScript errors
- [x] All imports correct
- [x] Callbacks properly typed
- [x] Null checks in place

### Functional Completeness
- [ ] Button renders only for CHECK_IN
- [ ] Navigation works correctly
- [ ] Query params passed correctly
- [ ] Form pre-fills from params
- [ ] Form submits successfully
- [ ] Database record created
- [ ] Redirects to detail page

### Error Handling
- [ ] Invalid data rejected
- [ ] Network errors handled
- [ ] User feedback provided

### Documentation
- [x] Integration documented
- [x] Data flow mapped
- [x] Testing plan created
- [ ] Manual tests completed

---

## 🎯 Next Steps After E2E Validation

**If All Tests Pass ✅:**
1. Create final checkpoint: SOFIA-MOD-EXPEDIENTES-PHASE1-FINAL-20260123.md
2. Mark Phase 1.3 as 100% complete
3. Update PROYECTO.md to Phase 1 completion (95-100%)
4. Handoff to INTEGRA for Phase 2 planning

**If Issues Found ❌:**
1. Document issues in this plan
2. Create fixes
3. Re-run tests
4. Repeat until all pass

---

## 📝 Testing Notes

**Tester:** _________________  
**Date:** _________________  
**Result:** ☐ PASS  ☐ FAIL  ☐ BLOCKED  

**Issues Found:**
- Issue 1: ___________________________________________
- Issue 2: ___________________________________________

**Comments:**
_________________________________________________________________
_________________________________________________________________

---

## 🔗 Related Documents

- [SOFIA-MOD-EXPEDIENTES-PHASE3-CITAS-INTEGRATION-20260123.md](../Checkpoints/SOFIA-MOD-EXPEDIENTES-PHASE3-CITAS-INTEGRATION-20260123.md)
- [PROYECTO.md](../../PROYECTO.md)
- [SPEC-MODULOS-AMI.md](../../context/SPEC-MODULOS-AMI.md)

---

**Status:** ✅ READY FOR TESTING  
**Maintained by:** SOFIA (Builder Principal)  
**Last Updated:** 2026-01-23
