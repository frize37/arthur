---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/wizard/WizardApp.tsx","src/app/advisor/AdvisorApp.tsx","src/app/admin/AdminApp.tsx"]
---

# Landing page (`/`)

Scope: public landing page. Visitor mode: Persuade. Primary visitor: homeowners in Israel with an existing mortgage. Secondary: mortgage advisors, reached through a separate "יועצים? הצטרפו" section near the end of the page, with a link in the header. Primary action: open a free case (`/wizard`). Proof: the live public stats and the real advisor roster (`fetchPublicStats`, `fetchPublicAdvisors`). Every illustrative figure is labeled "נתוני הדגמה". Constraints: RTL Hebrew. The bear is the central presenter and must be clearly visible, in front of the other elements, never hidden behind them. Must not feel childish.

Memorable moment: the case story in the first viewport. The file goes out to 4 advisors, offer slips clip onto the sheet one by one, the best one is flagged, and Arthur's stamp lands.

Cross-surface reach:
- Wizard: filling in the case. Each answered stage leaves a stamp on its tab.
- Advisor dashboard: the case cabinet. Cases are folders with tabs.
- Admin console: the registry.

## Direction contract

THESIS: The site is your case file. Arthur opens it, checks it, blacks out whatever identifies you, and hands it to advisors who compete for it. It refuses the category default: a gradient hero, three icon cards and a stats tile row.

OWN-WORLD:
- Ground: deep navy desk (#0D1E3B), with an open navy folder (#1A3A6E / #214784) whose spine is the only line the composition hangs on.
- Paper: warm off-white sheets (#F6F3EC) with ruled fields and black redaction bars.
- Color: index tabs in cap yellow (#FFC21A), hoodie teal (#0FA3B5), coral (#F08A5D) and paper. Offer slips with a colored top edge and a paper clip. A red rubber stamp (#C8462E).
- Type: Secular One for display, Assistant for body. Tabular numerals.
- Corners: 6–10px on paper, 20px on the folder.

STORY: The visitor understands that one short questionnaire opens a case. They believe their identity stays blacked out, that real humans compete, that it's free, and that Arthur is on their side. Then they open a case.

FIRST VIEWPORT:
- Header: wordmark, nav, and the advisor join link.
- The open folder fills the viewport.
- Right panel (cover): the paper label with the H1 "אל תיקחו משכנתה לפני שארתור בודק", the lede, the CTA "לפתוח תיק בחינם" and the trust ticks.
- Left panel: the case sheet, with a redacted name row, the 4-advisor routing dots, three offer slips and the stamp.
- Arthur (the full bear, about 280px) stands in front, on the spine, fully visible, holding the magnifier toward the sheet.
- Index tabs on the folder's left edge are the section nav.
- Signature interaction: the case story, played once and settled in about 4 seconds. Reduced motion shows the final state.

FORM: case file / office folder, position 4 of the ordered grounded list, assigned by seed 85b2f270.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
