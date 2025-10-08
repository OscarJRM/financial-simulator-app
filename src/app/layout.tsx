import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { InstitutionProvider } from "@/features/institution/context/InstitutionProvider";
import { AuthProvider } from "@/features/auth/context/AuthProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Financial Simulator App",
  description: "Simulador financiero para créditos e inversiones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        <InstitutionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </InstitutionProvider>
      </body>
    </html>
  );
}
