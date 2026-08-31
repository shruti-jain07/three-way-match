import { Inter, IBM_Plex_Mono } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import "./globals.css";
 
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
 
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});
 
export const metadata = {
  title: "Three-Way Match Engine",
  description: "PO / GRN / Invoice reconciliation",
};
 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plexMono.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}