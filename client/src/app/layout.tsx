import Navigation from "@/components/Navigation";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/hook/provider";
const inter = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Review Book",
    description: "Review Book by Flask - Next",
};

export default function RootLayout({
    children,
}: {
  
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <div className="bg-[#898680] h-screen p-4">
                    <div className="bg-[#c7c4bd] h-full p-2 rounded-xl">
                        <div className="bg-[#f2f1ea] h-full rounded-xl">
                          <Providers >{children}</Providers>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
