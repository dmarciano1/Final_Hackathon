export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased bg-black text-white overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
