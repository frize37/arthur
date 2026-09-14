import type { Metadata } from "next";
import { Rubik, Assistant } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ארתור",
  description: "ארתור — הדובי שבודק ומחזר משכנתאות: אשף ללקוח, לוח בקרה ליועץ, וקונסולת ניהול.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${assistant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
