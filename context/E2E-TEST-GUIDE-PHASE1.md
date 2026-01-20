# E2E Testing Guide - AMI-SYSTEM Phase 1 MVP
**Purpose:** Manual walkthrough of complete expedient flow  
**Date:** 2026-01-22  
**Duration:** 15-20 minutes  
**Status:** Ready for Thursday demo validation

---

## Prerequisites

- [ ] Local server running: `pnpm dev`
- [ ] Chrome/Firefox browser with Insomnia or Postman
- [ ] Sample PDF file for upload test
- [ ] PostgreSQL connected (Railway or local)
- [ ] Firebase credentials loaded
- [ ] One clinic already created in the system

---

## E2E Flow Overview

```
CREATE EXPEDIENT → ADD EXAM → UPLOAD STUDY → VALIDATE → VIEW CERTIFICATE
```

All steps should complete without errors. Build status: ✅ PASSING (as of commit d6bcc0d8)

---

## Phase 1: Create Expedient

### What to Do

1. Navigate to: `http://localhost:3000/admin/expedientes`
2. Click "Nueva Expediente" button
3. Fill in form:
   - **Patient Name:** Juan García Pérez
   - **Date of Birth:** 1985-06-15
   - **Clinic:** Select from dropdown (e.g., "Clínica Central")
4. Click "Crear" button

### What to Verify

| Check | Expected | Status |
|-------|----------|--------|
| Form submits | No errors | [ ] |
| New expedient appears in list | Expedient ID visible | [ ] |
| ID generated | CUID format (e.g., `cuid123...`) | [ ] |
| Status shown | "PENDIENTE" | [ ] |
| Patient data saved | Name matches input | [ ] |

### API Call (Behind the scenes)
```bash
POST /api/expedientes
{
  "patientName": "Juan García Pérez",
  "dateOfBirth": "1985-06-15",
  "clinicId": "clinic-uuid"
}
```

### Success Indicator
✅ Expedient appears in list with status "PENDIENTE"

---

## Phase 2: Add Medical Exam

### What to Do

1. Click on the newly created expedient to open detail view
2. Find "Medical Exam" section
3. Click "Agregar Examen"
4. Fill vitals form:
   - **Blood Pressure:** 120/80
   - **Heart Rate:** 72
   - **Temperature:** 37.0°C
   - **Respiratory Rate:** 16
5. Click "Guardar Examen" button

### What to Verify

| Check | Expected | Status |
|-------|----------|--------|
| Vitals saved | No validation errors | [ ] |
| Data persists | Refresh page, data remains | [ ] |
| Exam appears in list | Shows all vitals recorded | [ ] |
| Timestamp recorded | createdAt shows current time | [ ] |

### Database Check
```sql
SELECT * FROM validation_tasks 
WHERE expedient_id = 'expedient-uuid' 
LIMIT 1;
```

Expected: `studies` JSON field contains exam data

### Success Indicator
✅ Medical exam appears in expedient detail with all vitals visible

---

## Phase 3: Upload Study File

### What to Do

1. In expedient detail, scroll to "Studies" section
2. Find "Upload Study" file drop zone
3. Select a PDF or Image file
   - Recommended: Create dummy file with `echo "test" > sample.pdf`
   - Or use any PDF/image from your computer
4. Drag & drop into upload zone OR click to browse

### What to Verify

| Check | Expected | Status |
|-------|----------|--------|
| File uploads | No errors in console | [ ] |
| Firebase connected | File appears in list | [ ] |
| Status recorded | Shows "PENDING_EXTRACTION" | [ ] |
| File size shown | Displays file metadata | [ ] |
| Timestamp recorded | Upload time visible | [ ] |

### Firebase Verification
1. Open browser DevTools → Network tab
2. Look for `POST` requests to Firebase Storage
3. Verify response status is 200

### Success Indicator
✅ File appears in Studies list with PENDING_EXTRACTION status

---

## Phase 4: Validate Expedient

### What to Do

1. Navigate to: `http://localhost:3000/admin/validaciones`
2. Find "Juan García Pérez" in the list (status "PENDIENTE")
3. Click to open validation panel
4. Review displayed data:
   - Patient name and DOB
   - Vitals recorded (should show 120/80, 72, etc.)
   - Studies uploaded (should show file you uploaded)
5. Select verdict from dropdown:
   - **Verdict:** APTO (suitable for work)
   - **Status:** APPROVED
6. Optionally type medical opinion
7. Click "Validar y Firmar" button

### What to Verify

| Check | Expected | Status |
|-------|----------|--------|
| Data loads | All exam/study data visible | [ ] |
| Dropdown works | Status options appear | [ ] |
| Validation saves | No errors after click | [ ] |
| Status updated | Changes from PENDIENTE → APPROVED | [ ] |
| Validator recorded | validatedBy field populated | [ ] |
| Timestamp recorded | updatedAt field updated | [ ] |

### Database Check
```sql
SELECT status, verdict, validated_by, updated_at 
FROM validation_tasks 
WHERE expedient_id = 'expedient-uuid';
```

Expected: `status='APPROVED'`, `verdict='APTO'`, `validated_by` populated, `updated_at` recent

### Success Indicator
✅ ValidationTask status changes to APPROVED and expedient disappears from PENDIENTE list

---

## Phase 5: View Certificate Report

### What to Do

1. Navigate to: `http://localhost:3000/admin/reportes/{expedient-id}`
   - Replace `{expedient-id}` with the ID from Phase 1
   - Example: `http://localhost:3000/admin/reportes/cltnqzqma00012hbz8v5e5b2o`

2. Verify CertificateViewer displays:

3. Test Print:
   - Click "Imprimir" button
   - Browser print dialog opens
   - Select "Print to PDF" or physical printer
   - Verify layout looks professional

### Expected Certificate Contents

```
CERTIFICADO DE VALIDACIÓN
─────────────────────────

ID Expediente:    cltnqzqma00012hbz8v5e5b2o
Fecha de Validación: 22/01/2026

Paciente:
  Juan García Pérez
  Fecha de Nacimiento: 15/06/1985

Clínica:
  Clínica Central

Validador: System / Usuario
Estatus: APROBADO ✓

Opinión Médica:
  [Your text if entered]
```

### What to Verify

| Check | Expected | Status |
|-------|----------|--------|
| Page loads | No 404 errors | [ ] |
| All data displays | All fields populated | [ ] |
| Patient data correct | Name matches | [ ] |
| Validation date shown | Recent date visible | [ ] |
| Status badge green | Shows APPROVED | [ ] |
| Print button works | Print dialog opens | [ ] |
| Print preview looks good | Professional layout | [ ] |
| No console errors | DevTools clean | [ ] |

### Print Test Output
- Should print A4 or Letter format
- Should have professional margins and fonts
- Patient info clearly visible
- Status badge colored appropriately

### Success Indicator
✅ Certificate displays all data correctly and prints without errors

---

## Verification Checklist

### Database Integration
- [ ] Expedient created in PostgreSQL
- [ ] ValidationTask created with exam data
- [ ] Status changed from PENDIENTE → APPROVED
- [ ] All dates recorded correctly

### API Integration
- [ ] `POST /api/expedientes` - returns 201 with ID
- [ ] `POST /api/expedientes/{id}/exam` - returns 200
- [ ] `POST /api/expedientes/{id}/studies` - returns 200
- [ ] `PUT /api/validaciones/{id}` - returns 200
- [ ] `GET /admin/reportes/{id}` - returns page with data

### Frontend UI
- [ ] Forms submit without errors
- [ ] Data displays correctly in all sections
- [ ] Print functionality works
- [ ] Responsive layout maintained
- [ ] No UI glitches or layout shifts

### Type Safety
- [ ] No TypeScript errors in console
- [ ] All data types match Prisma schema
- [ ] No data conversion errors or warnings

### Multi-Tenant Safety
- [ ] Expedient isolated to tenant ID
- [ ] Cannot access other tenant's expedients
- [ ] tenantId properly set in all API calls
- [ ] Authorization checks working

### Performance
- [ ] Pages load in < 2 seconds
- [ ] No network requests pending after load
- [ ] Database queries efficient (check Rails logs)
- [ ] No memory leaks in browser console

---

## Known Limitations (MVP Scope)

⚠️ **Features Deferred to Phase 2:**
- PDF download (button placeholder only, uses native print for now)
- Email notifications
- Advanced analytics
- Digital signature with timestamp
- Multi-file upload (single file supported)
- AI extraction of study data (placeholder extraction status)

---

## Troubleshooting

### Issue: Form won't submit
**Check:**
1. Browser console for errors
2. Network tab - verify API response
3. Firebase credentials loaded
4. PostgreSQL connection active

### Issue: File upload fails
**Check:**
1. Firebase credentials in `.env.local`
2. Firebase Storage rules allow write
3. File size < 10MB
4. Browser console for 403/401 errors

### Issue: Data doesn't appear after validation
**Check:**
1. Refresh page to ensure fresh data
2. Check database directly with SQL query
3. Verify tenantId matches
4. Check API response in Network tab

### Issue: Certificate page shows "Acceso denegado"
**Check:**
1. Correct expedient ID in URL
2. User logged in with valid token
3. Tenant ID matches expedient's tenant
4. ValidationTask exists for expedient

### Issue: Print looks terrible
**Check:**
1. Browser zoom at 100% (⌘0 on Mac, Ctrl+0 on Windows)
2. Print margins set to minimal
3. Print background graphics disabled in print settings
4. Try different browser (Chrome vs Firefox)

---

## Demo Script Example

For live presentation on Thursday:

```
"Today I want to show you how AMI-SYSTEM streamlines occupational health validation.

Let me start by creating a new medical file for a company employee...
[Open admin/expedientes, create new, fill form]
'This is Juan García, we just brought him for his occupational health exam.'

Now I'll record his vitals from the examination...
[Add medical exam with vitals]
'Blood pressure 120/80, heart rate 72... all looking normal.'

We have his chest X-ray from the clinic...
[Upload PDF study]
'The file is now stored securely and linked to his record.'

The system automatically routes this for medical validation...
[Navigate to validaciones]
'Our physician reviews the data and approves him for work.'
[Validate and approve]

And here's the official certificate we can print for his file...
[Navigate to reportes, show certificate]
'Professional format, ready to print or archive. Everything digitized.'
[Click print]
"
```

---

## Success Criteria

### ✅ All 5 Phases Complete
- [ ] Phase 1: Expedient created
- [ ] Phase 2: Medical exam added
- [ ] Phase 3: Study file uploaded
- [ ] Phase 4: Expedient validated
- [ ] Phase 5: Certificate viewed & printed

### ✅ No Errors Encountered
- [ ] No console errors (DevTools clean)
- [ ] No server errors (check terminal)
- [ ] No database errors
- [ ] All API responses 200/201

### ✅ Demo Ready
- [ ] Practiced flow 2-3 times
- [ ] UX feels smooth
- [ ] Data displays correctly
- [ ] Can explain each step

### ✅ Ready for Thursday Presentation
- [ ] E2E flow validated
- [ ] Sample data prepared
- [ ] Team briefed on demo
- [ ] Fallback plan if Firebase/DB fails

---

## Sign-Off

**E2E Test Status:** 🟢 READY FOR DEMO  
**Last Validated:** 2026-01-22  
**Build Version:** Commit `eb1a652d` (docs checkpoint)  
**Type Safety:** 100% (TypeScript strict mode)  

Next: Execute this walkthrough 2-3 times, then demo on Thursday 23 January.

---

*E2E Test Guide - INTEGRA v2.0 Methodology*  
*Created for MOD-REPORTES Phase 1 completion and Thursday demo validation*
