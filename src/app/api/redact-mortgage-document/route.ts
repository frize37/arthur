import "server-only";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { PDFDocument, rgb } from "pdf-lib";

export const runtime = "nodejs";

const MODEL = "gemini-3.6-flash";

const BOX_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      label: { type: "string" },
      page: { type: "integer", description: "0-indexed page number this box is on" },
      box_2d: {
        type: "array",
        items: { type: "integer" },
        description: "[ymin, xmin, ymax, xmax] normalized 0-1000 relative to that page",
      },
    },
    required: ["box_2d"],
  },
};

const PROMPT = `זהו דוח בנקאי (יתרות משכנתא / אישור עקרוני). מצא ותחזיר תיבות תיחום (bounding boxes) עבור כל פרט מזהה אישי במסמך: שם מלא של הלווה/ים, מספר תעודת זהות, כתובת מגורים, ומספר חשבון בנק.

אל תכלול: שם הבנק, מספרי הלוואה, סניף, טלפון/פקס של הבנק, ריביות, יתרות כספיות, תאריכים, או כל מידע פיננסי אחר — רק פרטים שמזהים את הלקוח באופן אישי.

אם המסמך מכיל כמה עמודים, ציין את מספר העמוד (page, מתחיל מ-0) לכל תיבה. החזר מערך JSON ריק [] אם לא נמצא מידע מזהה.`;

interface Box {
  label?: string;
  page?: number;
  box_2d: [number, number, number, number];
}

async function getPersonalInfoBoxes(base64: string, mimeType: string, apiKey: string): Promise<Box[]> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: base64 } }, { text: PROMPT }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: BOX_SCHEMA },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [];
}

// Boxes come back tight around the text — pad them a bit so imprecision
// in the model's box doesn't leave a sliver of the real text visible.
const PAD = 12; // out of 1000

async function redactImage(bytes: Buffer, boxes: Box[]): Promise<Buffer> {
  const img = sharp(bytes);
  const meta = await img.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height || boxes.length === 0) return bytes;

  const rects = boxes
    .map(({ box_2d }) => {
      const [ymin, xmin, ymax, xmax] = box_2d;
      const x = Math.max(0, Math.round(((xmin - PAD) / 1000) * width));
      const y = Math.max(0, Math.round(((ymin - PAD) / 1000) * height));
      const w = Math.min(width - x, Math.round(((xmax - xmin + 2 * PAD) / 1000) * width));
      const h = Math.min(height - y, Math.round(((ymax - ymin + 2 * PAD) / 1000) * height));
      if (w <= 0 || h <= 0) return "";
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="black"/>`;
    })
    .join("");
  const overlay = Buffer.from(`<svg width="${width}" height="${height}">${rects}</svg>`);

  return sharp(bytes)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .toFormat(meta.format === "jpeg" ? "jpeg" : "png")
    .toBuffer();
}

async function redactPdf(bytes: Buffer, boxes: Box[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = pdfDoc.getPages();

  for (const box of boxes) {
    const page = pages[box.page ?? 0];
    if (!page) continue;
    const { width, height } = page.getSize();
    const [ymin, xmin, ymax, xmax] = box.box_2d;
    const x = Math.max(0, ((xmin - PAD) / 1000) * width);
    const w = Math.min(width - x, ((xmax - xmin + 2 * PAD) / 1000) * width);
    const hBox = Math.min(height, ((ymax - ymin + 2 * PAD) / 1000) * height);
    // PDF origin is bottom-left; Gemini's ymin/ymax are top-down.
    const yTop = ((ymin - PAD) / 1000) * height;
    const y = Math.max(0, height - yTop - hBox);
    if (w <= 0 || hBox <= 0) continue;
    page.drawRectangle({ x, y, width: w, height: hBox, color: rgb(0, 0, 0) });
  }

  return Buffer.from(await pdfDoc.save());
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "שירות הטשטוש לא מוגדר בשרת." }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "לא צורף קובץ." }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "סוג קובץ לא נתמך." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const boxes = await getPersonalInfoBoxes(bytes.toString("base64"), file.type, apiKey);
    const redacted = file.type === "application/pdf" ? await redactPdf(bytes, boxes) : await redactImage(bytes, boxes);

    return NextResponse.json({
      ok: true,
      mimeType: file.type,
      base64: redacted.toString("base64"),
      redactedCount: boxes.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Document redaction failed:", message);
    return NextResponse.json({ ok: false, error: "טשטוש המסמך נכשל.", detail: message }, { status: 500 });
  }
}
