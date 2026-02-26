# VyaparBuddy

VyaparBuddy is a mobile-first accounting and daily operations prototype for Indian MSMEs (kirana stores, freelancers, small retailers, and micro-manufacturers).

## Features

- **Dashboard + 10-Minute EOD recap** with quick metrics:
  - Cash in Drawer
  - Bank Balance
  - Money to Collect (Debtors)
  - Money to Pay (Creditors)
- **Simplified transaction logging** (Cash/UPI/Credit sales, expenses, owner draw).
- **Udhaar manager** with one-click WhatsApp reminder links.
- **Invoice generator** with GST/non-GST option and basic stock deduction.
- **Petty cash box** allocation and petty expense tracking.
- **CA export** to CSV for monthly compliance workflows.
- **Offline-first behavior** using localStorage + service worker caching.
- **Vernacular support** (English, Hindi, Gujarati, Marathi, Tamil).

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Notes

- This is a front-end prototype focused on usability and workflow simplification.
- Integrations like WhatsApp Business API, UPI deep links, and cloud backup are represented with frontend-ready hooks and UX flows.
