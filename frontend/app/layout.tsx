import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recicla Entulhos",
  description: "Gerenciamento de caçambas e aluguéis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className="min-h-screen bg-zinc-100 text-zinc-900"
      >
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
