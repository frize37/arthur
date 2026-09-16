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

// Stateless one-time code: the code itself never leaves the server except
// inside the email. The browser only ever holds a signed token carrying
// {email, code, exp} — it can't be read or forged without SECRET, so there's
// no server-side store to keep, expire, or clean up.
export async function createEmailVerification(email: string): Promise<string> {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const exp = Date.now() + TTL_MS;
  const payloadB64 = Buffer.from(JSON.stringify({ email, code, exp }), "utf8").toString("base64url");
  const token = `${payloadB64}.${sign(payloadB64)}`;
  await sendVerificationCodeEmail(email, code);
  return token;
}

export function checkEmailVerification(token: string, email: string, code: string): boolean {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig || !safeEqual(sign(payloadB64), sig)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (Date.now() > parsed.exp) return false;
    if (parsed.email !== email) return false;
    return safeEqual(String(parsed.code), code);
  } catch {
    return false;
  }
}
