import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <aside>
        <p>Copyright © 2025 - 👑 QueenB</p>
      </aside>
      <nav>
        <a href="https://queenb.org.il/" aria-label="Website">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm7.93 8h-3.17a15.82 15.82 0 00-1.04-4.34 8.015 8.015 0 014.21 4.34zm-7.93-7a7.978 7.978 0 015.42 2.11 14.19 14.19 0 01-4.51 4.28A15.567 15.567 0 0011 5.05V3zm-2 0v2.05a15.567 15.567 0 00-2.91 4.34 14.19 14.19 0 01-4.51-4.28A7.978 7.978 0 009 3zm-7.93 9a7.933 7.933 0 01.44-2.83h3.17a15.82 15.82 0 001.04 4.34 8.015 8.015 0 01-4.21-1.51zm1.36 3.17a7.953 7.953 0 012.45-1.9 16.193 16.193 0 003.62 3.68 15.872 15.872 0 01-6.07-1.78zm8.57 2.83v-2.05a15.567 15.567 0 002.91-4.34 14.19 14.19 0 014.51 4.28 7.978 7.978 0 01-7.42 2.11zm2.43-3.88a16.193 16.193 0 00-3.62-3.68 15.872 15.872 0 016.07 1.78 7.933 7.933 0 01-2.45 1.9zm2.79-5.29H18.57a8.01 8.01 0 00-4.22-4.35 15.817 15.817 0 015.32 4.35zm-7.79 2H7.43a8.008 8.008 0 004.22 4.35 15.817 15.817 0 00-5.32-4.35z" />
          </svg>
        </a>
        <a
          href="https://www.instagram.com/queenbprogram?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          aria-label="Instagram"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0120.5 7.75v8.5a4.25 4.25 0 01-4.25 4.25h-8.5A4.25 4.25 0 013.5 16.25v-8.5A4.25 4.25 0 017.75 3.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm4.75-.88a1.12 1.12 0 11-2.25 0 1.12 1.12 0 012.25 0z" />
          </svg>
        </a>
        <a
          href="https://www.facebook.com/share/g/17P4VmtGnj/"
          aria-label="Facebook"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
          </svg>
        </a>
      </nav>
    </footer>
  );
}
