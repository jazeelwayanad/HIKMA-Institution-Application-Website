import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AL-WARDA WOMEN'S COLLEGE | Application Portal",
    template: "%s | AL-WARDA WOMEN'S COLLEGE"
  },
  description: "Official online application portal for AL-WARDA WOMEN'S COLLEGE. Apply for our diverse courses and track your admission status in real-time.",
  keywords: ["education", "college application", "AL-WARDA", "admissions", "women's education"],
  openGraph: {
    title: "AL-WARDA WOMEN'S COLLEGE | Application Portal",
    description: "Secure and easy course applications for AL-WARDA WOMEN'S COLLEGE.",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">
        {children}
      </body>
    </html>
  );
}
