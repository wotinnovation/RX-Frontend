import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";
import { DataProvider } from "@/lib/context/data-context";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  title: "RxSales - Medical Sales Dashboard",
  description: "Advanced pharmaceutical sales management platform",
  icons: {
    icon: "/images/favicon/rx-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ubuntu.variable} antialiased selection:bg-primary/30 relative min-h-screen overflow-x-hidden font-ubuntu`}
      >
        {/* Decorative Blobs */}
        <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="fixed bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-300/20 rounded-full blur-[120px] pointer-events-none z-0" />
        
        <div className="relative z-10 min-h-screen">
          <AuthProvider>
            <DataProvider>
              <SidebarWrapper>{children}</SidebarWrapper>
            </DataProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
