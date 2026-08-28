# TODO - Register Display Fix & Password Visibility Toggle

## ✅ Step 1: Fix register.ts - DONE
- Replaced inline `template:` with `templateUrl: './register.html'`
- Removed inline `styles:` array
- Added `showPassword`, `showConfirmPassword` boolean properties
- Added `togglePasswordVisibility(field: string)` method
- Added missing `onFileSelected()`, `cvFile`, `cvError` properties
- Added `cvFileName` to candidature model

## ✅ Step 2: Update register.html - DONE
- Added eye toggle icon on password field
- Added eye toggle icon on confirm password field

## ✅ Step 3: Update register.css - DONE
- Added `.password-input-wrapper` and `.password-toggle` CSS styles

## ✅ Step 4: Update login.ts - DONE
- Added `showPassword` boolean property
- Added `togglePasswordVisibility()` method

## ✅ Step 5: Update login.html - DONE
- Added eye toggle icon on password field with dynamic type binding

## ✅ Step 6: Update login.css - DONE
- Added `.input-icon .password-toggle` CSS styles
- Adjusted padding on input field to accommodate eye icon
- Added RTL support for password toggle

