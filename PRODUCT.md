# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Homeowners in Israel with an existing mortgage (primary):** usually not finance experts. They want to know, with no commitment and no pressure, whether refinancing is worth it. They need to trust the product and find it simple.
- **Mortgage advisors (secondary, also a target audience):** they receive anonymized cases, submit price quotes and support the client through to closing. The landing page also needs to persuade advisors to join the platform.
- **The office / admins:** they manage cases, accounts and advisors, and can correct client answers.

## Product Purpose

Arthur ("ארתור", the bear who checks and refinances mortgages) runs every mortgage or loan past several advisors at once. It checks whether refinancing is feasible and what it would cost to do. The client fills in a short questionnaire (about 2 minutes), uploads a balance report or enters the loan details by hand, and verifies their email. The case then goes, anonymized, to several advisors who compete for it. Success means the client gets the best-value offer and a real human advisor who works with them through to the end.

## Positioning

A competitive quote marketplace that works on the client's side of the table, against the bank's interest. Advisors compete for the case at the same time. A real, human advisor does the work, not a chatbot or a calculator. Advisors are measured on the savings they achieve, their service and their speed, and an advisor with low ratings does not continue on the platform.

## Operating Context

- Surfaces: a public landing page (`/`), a client wizard (`/wizard`), an advisor dashboard (`/advisor`), an admin console (`/admin`), login, and legal pages (about, accessibility, privacy, terms).
- Case chat between the client, the advisor and the office. Case documents. Case numbers.
- Balance-report PDFs are parsed and redacted. The report itself is not stored, only the anonymized financial data.

## Capabilities and Constraints

- Hebrew only, RTL (`lang="he" dir="rtl"`).
- Next.js 16 (App Router), React 19, Tailwind v4, Supabase, Resend.
- The client's contact details are revealed only to the chosen advisor, and only after the client approves.
- Free, with no commitment.
- Public stats (cases checked, cases closed, savings, mortgage volume) are live data from Supabase.
- The public advisor roster comes from real advisor profiles.
- The site intentionally does not follow the OS dark-mode setting.

## Brand Commitments

- The name "ארתור" (Arthur), the wordmark and the bear mascot are the central anchor and must be kept. Assets: `public/brand/`, `src/components/ArthurMascot.tsx`, `src/app/wizard/components/RiggedBear.tsx`.
- Voice: warm and direct, second person plural ("אתם"), no jargon.

## Evidence on Hand

- Live stats and real advisor profiles from the database.
- No testimonials, press or media logos exist. Do not invent them.

## Product Principles

1. Trust before anything else: privacy and "no commitment" have to be visible, not buried in the small print.
2. A real person, not a machine: the human advisor sits at the center.
3. Competition in the client's favor is the core difference, and it has to be understood in seconds.
4. Simplicity for people who aren't finance experts. Advisors and the office get efficiency and fast scanning.

## Accessibility & Inclusion

An accessibility statement page exists (`/accessibility`). Aim for WCAG AA, full keyboard use and proper RTL.
