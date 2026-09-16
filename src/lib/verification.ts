import "server-only";
import crypto from "crypto";
import { sendVerificationCodeEmail } from "./email";

const SECRET = process.env.VERIFICATION_SECRET ?? "";
const TTL_MS = 10 * 60 * 1000;

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// A keyed hash of the code, not the code itself — codeHash alone can't be
// reversed back to the 4-digit code without SECRET, unlike the code being
// stored directly. (An earlier version of this file put the raw code inside
// the token — since HMAC only proves the token wasn't tampered with, not
// that its contents are private, that let anyone read the code straight out
// of the token the client legitimately holds, skipping email delivery
// entirely. Never do that again.)
function hashCode(code: string): string {
  return crypto.createHmac("sha256", SECRET).update(`code:${code}`).digest("hex");
}

// Stateless one-time code: the browser only ever holds a signed token
// carrying {email, codeHash, exp} — it can't be read or forged without
// SECRET, so there's no server-side store to keep, expire, or clean up.
export async function createEmailVerification(email: string): Promise<string> {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const exp = Date.now() + TTL_MS;
  const payloadB64 = Buffer.from(JSON.stringify({ email, codeHash: hashCode(code), exp }), "utf8").toString("base64url");
  const token = `${payloadB64}.${sign(payloadB64)}`;
  const result = await sendVerificationCodeEmail(email, code);
  if (!result.ok) {
    throw new Error(result.error ?? "שליחת המייל נכשלה.");
  }
  return token;
}

export function checkEmailVerification(token: string, email: string, code: string): boolean {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig || !safeEqual(sign(payloadB64), sig)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (Date.now() > parsed.exp) return false;
    if (parsed.email !== email) return false;
    return safeEqual(String(parsed.codeHash), hashCode(code));
  } catch {
    return false;
  }
}
