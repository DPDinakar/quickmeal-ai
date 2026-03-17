import "./globals.css";
import Navbar from "@/components/Navbar";
import { UserProvider } from "@/context/UserContext";

export const metadata = {
  title: "QuickMeal AI",
  description: "AI powered meal suggestion app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen">

        {/* ✅ Global User State */}
        <UserProvider>

          {/* ✅ Navbar (can access avatar instantly) */}
          <Navbar />

          {/* ✅ Pages */}
          {children}

        </UserProvider>

      </body>
    </html>
  );
}