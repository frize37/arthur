import type { Metadata } from "next";
import { Secular_One, Assistant } from "next/font/google";
import "./globals.css";

// Secular One is the case-file's label face: headings, stamps, big figures.
// It ships in one weight only, so never pair it with font-bold.
const secular = Secular_One({
  variable: "--font-secular",
  subsets: ["hebrew", "latin"],
  weight: "400",
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ארתור",
  description: "ארתור — הדובי שבודק ומחזר משכנתאות: אשף ללקוח, לוח בקרה ליועץ, וקונסולת ניהול.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${secular.variable} ${assistant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-desk text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
