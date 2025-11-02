import "../styles/globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="container">
          <header className="header">
            <h1>Licensing & NFT Metadata Guard</h1>
            <p>Pipeline seguro para pixel art y colecciones (CC0 + transformaci?n sustancial)</p>
          </header>
          <main>{children}</main>
          <footer className="footer">
            <small>Hecho para escalar a 5?10k piezas sin romper licencias.</small>
          </footer>
        </div>
      </body>
    </html>
  );
}
