import "./globals.css";

export const metadata = {
  title: "Petanque DKG Web",
  description: "Petanque DKG Web"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
