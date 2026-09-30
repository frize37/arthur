---
name: Arthur
description: The bear's case file. A navy desk, an open folder, warm paper, index tabs in the bear's colors, and a red rubber stamp.
colors:
  desk: "#0D1E3B"
  folder: "#1A3A6E"
  folder-in: "#214784"
  on-folder: "#FFFFFF"
  on-folder-soft: "#B8C6E0"
  paper: "#F4F1EA"
  surface: "#FFFDF8"
  surface-landing: "#F6F3EC"
  surface-2: "#EDE8DC"
  rule: "#D8D1C1"
  ink: "#13213A"
  ink-soft: "#4B5770"
  ink-faint: "#636C80"
  line: "rgba(19, 33, 58, 0.14)"
  line-strong: "rgba(19, 33, 58, 0.28)"
  accent: "#FFC21A"
  accent-strong: "#8F5B00"
  accent-soft: "#FFF0C4"
  hoodie: "#0FA3B5"
  teal: "#0A7F8E"
  teal-soft: "#D6F1F4"
  pop-warm: "#F08A5D"
  pop-warm-soft: "#FCE4D8"
  pop-soft: "#DEE6F3"
  stamp: "#C8462E"
  good: "#1E8452"
  watch: "#9A6A00"
  risk: "#C23B2A"
typography:
  display:
    fontFamily: "Secular One, Assistant, sans-serif"
    fontSize: "clamp(38px, 4.4vw, 64px)"
    fontWeight: 400
    lineHeight: 1.03
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Secular One, Assistant, sans-serif"
    fontSize: "clamp(30px, 3.4vw, 44px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Secular One, Assistant, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.12
  figure:
    fontFamily: "Secular One, Assistant, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "\"tnum\" 1"
  body:
    fontFamily: "Assistant, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  lede:
    fontFamily: "Assistant, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Assistant, sans-serif"
    fontSize: "13.5px"
    fontWeight: 800
    lineHeight: 1.4
rounded:
  redaction: "2px"
  slip: "4px"
  sheet: "6px"
  paper: "8px"
  control: "10px"
  folder: "20px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "24px"
  gutter: "clamp(16px, 4vw, 48px)"
  section: "clamp(64px, 8vw, 104px)"
components:
  button-primary:
    backgroundColor: "{colors.folder}"
    textColor: "{colors.on-folder}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "15px 26px"
  button-primary-hover:
    backgroundColor: "{colors.desk}"
    textColor: "{colors.on-folder}"
  button-yellow:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.desk}"
    rounded: "{rounded.control}"
    padding: "15px 26px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  choice:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "14px 16px"
  choice-selected:
    backgroundColor: "{colors.pop-soft}"
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "8px 15px"
  chip-selected:
    backgroundColor: "{colors.folder}"
    textColor: "{colors.on-folder}"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.paper}"
    padding: "10px 12px"
  index-tab:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.desk}"
    typography: "{typography.label}"
    padding: "16px 9px"
  index-tab-done:
    backgroundColor: "{colors.hoodie}"
    textColor: "{colors.desk}"
  paper-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "clamp(22px, 2.4vw, 30px)"
  folder-board:
    backgroundColor: "{colors.folder}"
    textColor: "{colors.on-folder}"
    rounded: "{rounded.folder}"
    padding: "clamp(24px, 3vw, 40px)"
  case-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "15px 17px"
  stamp:
    backgroundColor: "transparent"
    textColor: "{colors.stamp}"
    typography: "{typography.title}"
    rounded: "{rounded.paper}"
    padding: "6px 14px 5px"
---

# Design System: Arthur

## Overview

**Creative North Star: "The Bear's Case File"**

Every surface is one piece of a single office folder. The ground is a deep navy desk. On it lies an open navy folder whose spine is the one line a composition hangs on. Inside are warm off-white paper sheets with ruled fields and black redaction bars, index tabs in the bear's own colors (cap yellow, hoodie teal, coral, and paper), offer slips with a colored top edge and a paper clip, and a red rubber stamp. Arthur, the bear, is the presenter of that file: he stands in front of it, fully visible, never behind a sheet or a board.

The public surfaces (landing, wizard, login, legal pages) wear the world openly: the folder fills the first viewport, chapters are divider tabs, a stage is one sheet. The operate surfaces (advisor dashboard, admin console) keep their density and scanning speed; there the world lives only in the details. The desk becomes a navy top strip, content cards are paper sheets, cases are folders with an index tab on the top edge, stat tiles are ruled entries with a colored tab edge, and status pills are small printed tabs.

Money decisions are marked the way an office marks a file. The one celebration is a stamp landing on the case, never confetti. Motion is one authored story per surface, played once and settled.

**Key Characteristics:**
- Navy desk ground, navy folder boards, warm paper sheets on top.
- Index tabs in cap yellow, hoodie teal, coral and paper carry navigation, chapters and categories.
- Arthur is always visible and always in front of the file.
- Paper is square-topped wherever a tab or colored edge joins it; the rounding is on the bottom corners.
- Secular One for labels, headings and big figures in its single weight; Assistant for everything read.
- Tabular numerals on every figure.
- Inline SVG icons only.
- The celebration is a red rubber stamp.

## Colors

A fixed, deliberately non-adaptive palette: navy boards and desk, warm paper, and four tab colors taken from the bear himself. The site does not follow the OS dark-mode setting.

### Primary
- **Folder Navy** (folder): the folder boards, primary buttons, selected choices and chips, the active admin sidebar tab, case-row index tabs, and the highlighted word in a headline.
- **Desk Navy** (desk): the page ground under everything, the desk strip on top of the office dashboards, and the hover state of every primary button. It is also the text color on yellow and teal tabs.
- **Inner Board** (folder-in): the back board of the open folder, one step lighter than the cover so the spine reads.

### Secondary
- **Cap Yellow** (accent): the active chapter tab, the first index tab, the yellow CTA on navy, the headline underline mark, the "best offer" flag and ring, the slider thumb, and `::selection`. Deep Cap Yellow (accent-strong) is the text-safe version; Pale Cap Yellow (accent-soft) is the ground of Arthur's speech bubble and of the "did you know" note.
- **Hoodie Teal** (hoodie): finished chapter tabs, the routing dots, the savings-meter fill, and the focus ring. Deep Teal (teal) is its text-safe partner, used for trust ticks, icon strokes and links. Teal-soft grounds icon wells and file chips.

### Tertiary
- **Coral** (pop-warm): the fourth tab color. It appears on the last index tab, on offer slips, and on stat-tile edges. Coral-soft is its tint.
- **Stamp Red** (stamp): used only for the rubber stamp, the notification dot, and the login error border. It never carries a button or a heading.

### Neutral
- **Desk Paper** (paper): the ground of the office dashboards.
- **Sheet** (surface): paper sheets, choices, chips and case rows. On the landing page the sheet is warmed to Landing Sheet (surface-landing), with Slip white (#FBF9F4) for offer slips.
- **Card Stock** (surface-2): hover wells, the third (paper) tab, and tags.
- **Rule** (rule): ruled field lines, sheet borders, and the inset border on a paper label.
- **Ink** (ink): body text, the 2px rule under a sheet's head, and redaction bars. Ink Soft (ink-soft) carries secondary text and field labels. Ink Faint (ink-faint) carries meta lines.
- **Line / Line Strong** (line, line-strong): hairlines, ghost-button borders and input strokes on paper.
- **On Folder / On Folder Soft** (on-folder, on-folder-soft): text on the navy desk and boards.
- **Status** (good, watch, risk): gauge bands and match notes, always as a 12–16% tint with the solid color as text.

### Named Rules
**The Bear's Colors Rule.** Tabs, slip edges and stat-tile edges take their color from the bear only: cap yellow, hoodie teal, coral, paper, or folder navy. No other hue marks a category.

**The One Red Rule.** Stamp Red means "Arthur marked this file". Using it for decoration or for a button spends the stamp.

**The Fixed Palette Rule.** There is no `prefers-color-scheme` block. A dark theme exists only behind an explicit `data-theme="dark"` toggle.

## Typography

**Display Font:** Secular One (falling back to Assistant, then sans-serif)
**Body Font:** Assistant (with -apple-system, Segoe UI, sans-serif)

**Character:** Secular One is the file's label face: condensed, stamped, a little institutional. It sets headings, stamps, tab titles, buttons and big figures. Assistant does all the reading, set heavy (700–800) for labels and field values and regular for prose.

### Hierarchy
- **Display** (400, clamp(38px, 4.4vw, 64px), 1.03): the landing H1 on the cover label. In the wizard the cover H1 is clamp(32px, 5.4vw, 48px), 1.05.
- **Headline** (400, clamp(30px, 3.4vw, 44px), 1.1): landing section headings on the desk.
- **Title** (400, 18–24px, 1.12): sheet heads (23px), memo points (22px), office section heads (22px), card heads (18px), detail titles (24px), buttons (15.5–19px).
- **Figure** (Secular One 400, 20–34px, tabular numerals): offer amounts, ledger values, stat tiles, the savings total, slider readouts, the ratio.
- **Body** (Assistant 400, 16px, 1.6 to 1.7): prose on sheets, capped at 42–70ch.
- **Lede** (Assistant 400, 18px, 1.6): the cover lede and section subs.
- **Label** (Assistant 700–800, 12–15px): field labels, tab labels, trust ticks, pills, field values (800, tabular).

### Named Rules
**The One Weight Rule.** Secular One ships in weight 400 only. Never pair it with a bold class; every h1–h3 resets to `font-weight: 400`.

**The Tabular Ledger Rule.** Every number on paper uses tabular numerals (`.tabular`, `.num`, or `font-variant-numeric: tabular-nums`), and figures inside RTL text are isolated with `unicode-bidi: isolate`.

## Layout

The page is RTL Hebrew (`lang="he" dir="rtl"`). Public pages sit in a 1320px wrap with a clamp(16px, 4vw, 48px) gutter. Sections breathe at clamp(64px, 8vw, 104px) of vertical padding. The wizard narrows to a 760px column on a 1000px top bar. The office dashboards use a 1180px wrap.

The landing hero is an open folder: a two-column grid in which the right panel is the front cover, carrying the paper label with the offer, and the left panel is the back board, carrying the case sheet. A 2px spine runs down the middle. Arthur stands on that spine in front of both panels, about 200–300px wide, extending past the folder's bottom edge. Index tabs stick out of the back board's outer edge as vertical section navigation.

Below 960px the folder stacks into one column: the spine disappears, the index tabs turn horizontal above the sheet, and Arthur moves between the cover and the back board, still in front of both. Below 620px the wizard cover puts Arthur above the label.

The operate surfaces keep list density: case rows sit on an 18px gap with room for their index tab, and stat tiles sit in a row. The world never costs a row of data.

### Named Rules
**The Spine Rule.** A composition hangs on one line: the folder's spine, or a sheet's 2px ink head rule. Don't add competing dividers.

**The Bear In Front Rule.** Arthur is always fully visible and in front of the file (z-index above boards and sheets, a drop shadow onto the desk). Layout reserves room for him (the cover label leaves the spine side open) rather than letting a sheet overlap him.

## Elevation & Depth

Depth is physical: sheets lie on boards, boards lie on the desk. Paper casts a long, soft, dark shadow downward onto navy. Boards carry inset shading toward the spine instead of a drop shadow. On the pale office ground, cards drop to a much fainter shadow or to a flat 1.5px rule border, keeping scanning surfaces calm.

### Shadow Vocabulary
- **Paper on desk** (`box-shadow: 0 22px 34px -20px rgba(0, 0, 0, .55)`): every sheet, label, ledger, memo and card on navy.
- **Slip** (`box-shadow: 0 14px 24px -14px rgba(19, 33, 58, .55)`): offer slips and clipped notes.
- **Board fold** (`box-shadow: inset 26px 0 36px -26px rgba(0, 0, 0, .55)`): the folder's cover and back board shade into the spine.
- **Office card** (`box-shadow: 0 16px 28px -24px rgba(13, 30, 59, .6)`): content cards on the pale office ground.
- **Button lift** (`box-shadow: 0 12px 22px -12px rgba(26, 58, 110, .9)`): the primary folder-navy button.
- **Bear drop** (`filter: drop-shadow(0 22px 20px rgba(0, 0, 0, .45))`): Arthur, wherever he stands on navy.

### Named Rules
**The Paper Falls Rule.** Shadows fall downward with a large negative spread. There are no glows, no hard offsets, and no shadows pointing up (except the one shadow that separates stacked divider sheets).

## Shapes

Paper is gently rounded (6–8px); the folder is softer (18–20px); slips and redaction bars are nearly square (4px and 2px). Wherever a colored edge or index tab joins a sheet, the paper's top corners are square and only the bottom corners round (`0 0 6–10px 6–10px`): offer slips, advisor cards, case rows, stat tiles and the savings meter. Index tabs themselves round only on their free edge (`10px 10px 0 0` on top, or `0 10px 10px 0` on the side tabs) and sit flush against their sheet. A paper label carries an inset 1.5px rule border 9px in from its edge, like a printed form. Checkboxes are 4px squares, never circles. Monograms, slider thumbs and chapter badges are the only circles.

### Named Rules
**The Square Join Rule.** A sheet that carries a tab or a colored top edge is square-topped where they meet. Rounding a joined corner makes the tab float.

## Components

### Buttons
Tactile and stamped.
- **Shape:** control-rounded (10px on public pages, 8px in the office).
- **Primary:** Folder Navy with white Secular One text (17–19px), 15px 26px on the landing and 12px 24px in the wizard, plus the button-lift shadow. A trailing inline-SVG chevron points forward in RTL.
- **Hover / Focus:** turns Desk Navy and lifts 1–2px; press scales to .98. The global focus ring is a 3px Hoodie Teal outline, 2px offset.
- **Yellow:** Cap Yellow with Desk Navy text, used only on navy grounds (the advisor join panel and the closing CTA).
- **Ghost:** transparent with a 1.5px line-strong border; hover fills with Card Stock.
- **Disabled:** 40–45% opacity, no lift.

### Chips
- **Style:** Sheet ground, 1.5px Rule border, 8px radius, Assistant 600 at 14.5px.
- **State:** selected turns solid Folder Navy with white 800 text.

### Cards / Containers
- **Paper sheet:** Sheet ground, 6–8px radius, paper-on-desk shadow, a head row over a 2px ink rule, and ruled 1px Rule lines between fields.
- **Form box (wizard card):** white, 1.5px Rule border, 8px radius, no shadow.
- **Folder board:** Folder Navy, 18–20px radius, an inset top highlight, holding one sheet.
- **Internal padding:** clamp(16px, 3vw, 22px) up to clamp(22px, 2.4vw, 30px).

### Inputs / Fields
- **Style:** white fill, 1.5px line-strong stroke, 6–8px radius, Assistant 700 at 16px with tabular numerals.
- **Focus:** the border turns Folder Navy, with a 3px Hoodie Teal halo at 28–30% opacity.
- **Label:** Assistant 800 at 13.5–14px in Ink, with an optional Ink Soft hint.
- **Error:** a Stamp Red 1.5px border with Stamp Red bold text.

### Choices
Ruled answer rows. Each row has a Sheet ground, a 1.5px Rule border and an 8px radius. It holds a 38px teal-soft icon well, a bold title with a soft subtitle, and a square 22px checkbox at the far end. Selected: a Folder Navy border and inset line on a pop-soft ground, a solid navy icon well, and a filled navy checkbox.

### Navigation
- **Landing header:** the wordmark inverted to white, nav links in On Folder Soft (Assistant 700, 15px) that turn white on hover, and an outlined advisor join link that picks up a Cap Yellow border on hover.
- **Index tabs (section nav):** vertical tabs out of the folder's outer edge, in accent, hoodie, surface-2 and pop-warm order, with Desk Navy 800 text. Hover slides a tab 6px outward.
- **Office desk strip:** a Desk Navy top bar with a white Secular One brand name, a Cap Yellow avatar and Desk Navy initials.
- **Admin sidebar:** a column of index tabs. The active tab is Folder Navy with a Cap Yellow icon.

### Chapter Tabs (wizard progress)
The wizard's progress is a row of divider tabs on the folder's top edge. Upcoming tabs are a mid navy (#2B518F) with soft text. Finished tabs turn Hoodie Teal and show an inline-SVG check in a navy badge. The open tab is Cap Yellow, stands 6px taller, and has a more rounded top. On narrow screens only the open tab shows its label.

### Offer Slip
A near-square slip in Slip white, radius `0 0 4px 4px`, with a 5px top edge in a tab color and a slight rotation (about ±2deg). The first slip carries a drawn paper clip (a 3px #97A3B6 outline). The best offer gains a Cap Yellow 3px ring and a yellow "המשתלמת" flag.

### Case Row (office)
A case is a folder in the cabinet: a Sheet row with a 1.5px Rule border and radius `0 0 8px 8px`, with an 88px × 9px Folder Navy index tab on its top edge. On hover the border turns Folder Navy, the row lifts 1px, and a soft shadow appears.

### Stat Tile (office)
A ruled ledger entry with a 1.5px Rule border and a 5px top edge that cycles hoodie, accent, pop-warm and folder. It shows a Secular One 28px tabular figure over an Ink Soft 700 label.

### Rubber Stamp
Stamp Red Secular One text inside a 3–4px Stamp Red border with an 8–10px radius, rotated -8 to -12deg, with `mix-blend-mode: multiply` so it inks into the paper. It carries a small Assistant 800 "ע״י ארתור" line. It appears three ways: landing on the hero sheet (played once, at 3.5s), resting on the memo signature and the wizard's done panel, and as a full-screen flash (`stampFlash`) when a milestone is reached in the wizard, advisor or admin surfaces.

### Arthur's Note
Arthur's full-body image, 104–140px, next to a Pale Cap Yellow speech bubble with a `4px 14px 14px 14px` radius and a pointer toward him. The "did you know" tip is the same yellow paper clipped to the folder with a drawn clip, rotated -.4deg.

### Motion
One authored story per surface, with exponential ease-out (`cubic-bezier(.16, 1, .3, 1)`; UI transitions use `cubic-bezier(.2, .8, .2, 1)`). On the landing page: the bear rises (at 0.15s), the four routing dots fill teal, three slips clip on 0.6s apart, the best slip is ringed at 3.3s, and the stamp lands at 3.5s. The story settles in about 4 seconds. The wizard's story is a stage sheet sliding in (8px, .35s) plus its tabs changing color. Under `prefers-reduced-motion` the landing story renders its final state immediately.

## Do's and Don'ts

### Do:
- **Do** keep Arthur fully visible and in front of every board and sheet he shares a composition with, with the bear-drop shadow onto the desk.
- **Do** build new surfaces out of the file's own materials: desk, folder board, paper sheet, index tab, slip, stamp.
- **Do** color tabs and edges only in cap yellow (accent), hoodie teal (hoodie), coral (pop-warm), paper (surface-2) or folder navy.
- **Do** keep a sheet square-topped where a tab or colored edge joins it (`border-radius: 0 0 8px 8px`).
- **Do** keep the advisor and admin dashboards dense; express the world through tab edges, rule borders, the desk strip and the stamp, not through layout.
- **Do** set Secular One at weight 400 only, and put every figure in tabular numerals.
- **Do** draw every icon as inline SVG in `currentColor`.
- **Do** give each surface a single motion story with exponential ease-out, and render its settled final state under `prefers-reduced-motion`.
- **Do** mark milestones with the rubber stamp.
- **Do** label every illustrative figure "נתוני הדגמה".

### Don't:
- **Don't** hide, crop or layer anything over Arthur.
- **Don't** celebrate with confetti, bursts or particles; the celebration is a stamp.
- **Don't** use emoji or glyph characters as icons.
- **Don't** put kicker or eyebrow labels above headings.
- **Don't** round the top corners of a sheet where its tab attaches.
- **Don't** bold Secular One.
- **Don't** use Stamp Red for buttons, headings or decoration.
- **Don't** fall back to the category default of a gradient hero, three icon cards and a row of stat tiles.
- **Don't** add a `prefers-color-scheme` dark mode.
- **Don't** trade operate-surface density for decoration.
