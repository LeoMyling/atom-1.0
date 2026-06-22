import "./globals.css";

export const metadata = {
  title: "Glass Reveal Proof of Concept",
  description: "Standalone architectural glass reveal interaction."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
