# Translation Guide: Turkish to English

This guide provides instructions for completely translating the Production Tracking System from Turkish to English.

## Progress So Far

We've completed the following translations:

1. Created a comprehensive translations mapping file (`app/lib/translations.ts`)
2. Updated main components:
   - Main page (`app/page.tsx`)
   - Login page (`app/auth/system-login/page.tsx`)
   - OrderForm component (`app/components/OrderForm.tsx`)
   - LogoutButton component (`app/components/LogoutButton.tsx`) 
   - Work Orders page (`app/workorders/page.tsx`)
   - OrderList component (`app/components/OrderList.tsx`)
   - AccessDenied component (`app/components/AccessDenied.tsx`)

## Remaining Components to Translate

The following components still need translation:

1. Employee Management pages:
   - `app/employees/page.tsx`
   - `app/employees/create/page.tsx`
   - `app/employees/edit/[id]/page.tsx`

2. Machine Management pages:
   - `app/machines/page.tsx`
   - Machine create/edit pages

3. Customer Management pages:
   - `app/customers/page.tsx`
   - Customer create/edit pages

4. Wire Production Calculator:
   - `app/components/WireProductionCalculator.tsx`
   - `app/wire-production/page.tsx`

5. API Routes:
   - `app/api/orders/route.ts`
   - `app/api/system-auth/route.ts`
   - Other API routes

## Translation Process

1. **Add New Translations to the Helper File**: For each component, scan for Turkish text and add translations to the `app/lib/translations.ts` file.

2. **Update Component Files**: Replace Turkish text with the `t()` function calls:
   ```jsx
   // Before
   <h1>Çalışan Yönetimi</h1>
   
   // After
   <h1>{t("Çalışan Yönetimi")}</h1>
   ```

3. **Update Variable Names**: Look for Turkish variable and function names and change them to English equivalents.

4. **Update Comments**: Convert Turkish comments to English.

## Special Cases

1. **Date Formatting**: Replace Turkish date formatting with international format:
   ```js
   // Before
   return new Date(dateString).toLocaleDateString("tr-TR");
   
   // After
   return new Date(dateString).toLocaleDateString();
   ```

2. **Hard-coded UI Strings**: Some UI elements may have hard-coded Turkish text instead of using the translation function. These need to be identified and updated.

3. **Database Queries**: Some database queries might reference Turkish-named columns. These should be checked but left unchanged if they are part of the database schema.

## Testing

After translating each component:

1. Check the UI to ensure all visible text is in English
2. Test all functionality to ensure no bugs were introduced
3. Verify that forms and error messages display correctly in English

## Final Steps

Once all components are translated:

1. Update database seeding scripts and sample data
2. Update documentation and README
3. Create a language switcher component for future multilingual support if desired 