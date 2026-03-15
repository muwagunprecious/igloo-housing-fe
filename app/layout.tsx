import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./components/layout/BottomNav";
import EnhancedNavbar from "./components/layout/EnhancedNavbar";
import ToastContainer from "./components/common/Toast";
import Footer from "./components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "IGLOO - #1 Student Housing Marketplace in Nigeria",
    template: "%s | IGLOO Student Housing"
  },
  description: "Find and book premium, secure, and affordable student housing across Nigeria. Igloo connects students with verified hosts near top universities like UNILAG, UNIBEN, and more.",
  keywords: ["student housing Nigeria", "igloo student housing", "university accommodation Nigeria", "student rooms for rent", "off-campus housing", "Igloo Estate", "hostels in Nigeria"],
  authors: [{ name: "Igloo Team" }],
  creator: "Igloo Estate",
  publisher: "Igloo Estate",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "IGLOO - Find Your Perfect Student Home in Nigeria",
    description: "Verified student housing marketplace. Safe, affordable, and close to campus.",
    url: "https://igloo-housing-fe.vercel.app",
    siteName: "IGLOO Student Housing",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Make sure to provide this image later
        width: 1200,
        height: 630,
        alt: "Igloo Student Housing Nigeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IGLOO - Student Housing Marketplace Nigeria",
    description: "Book verified student accommodation near your campus in seconds.",
    creator: "@IglooNigeria",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <EnhancedNavbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <BottomNav />
        <ToastContainer />
      </body>
    </html>
  );
}
