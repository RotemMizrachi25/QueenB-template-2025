import { useState, useEffect } from "react";
import s from "./Header.module.css";

// Helper to detect RTL (Hebrew/Arabic)
const isRTL = (str = "") => /[\u0590-\u05FF\u0600-\u06FF]/.test(str);

export default function Header() {
  const [user, setUser] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        // Redirect to home page
        window.location.href = '/';
      } else {
        console.error('Logout failed');
        alert('Failed to sign out. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  // Pick first name smartly (with fallbacks)
  const rawFirstName =
      user?.firstName?.trim() ||
      user?.name?.trim()?.split(" ")[0] ||
      user?.profile?.firstName?.trim() ||
      (user?.email ? user.email.split("@")[0] : "");

  // Detect language direction based on the name
  const nameIsRTL = isRTL(rawFirstName);

  // Fallback label if first name is missing
  const typeFallback = user
      ? user.userType === "mentor"
          ? (nameIsRTL ? "מנטורית" : "Mentor")
          : (nameIsRTL ? "מנטית" : "Mentee")
      : "";

  // Final display name and greeting
  const displayName = rawFirstName || typeFallback || "";
  const greeting =
      displayName.length > 0
          ? nameIsRTL
              ? `ברוכה הבאה, ${displayName}!`
              : `Welcome, ${displayName}!`
          : nameIsRTL
              ? "ברוכה הבאה!"
              : "Welcome!";

  return (
    <header className={s.bar}>
      <div className={s.container}>
        <a href="/" className={s.logo}>
          <span className={s.crown} aria-hidden>
            👑
          </span>
          <span className={s.title}>Queens Match</span>
        </a>

        <nav className={s.navigation}>
          {user ? (
            // Show sign out when logged in
            <div className={s.userSection}>
              {/* Dynamic greeting by name & language */}
              <span className={s.welcomeText} dir={nameIsRTL ? "rtl" : "ltr"}>
                {greeting}
              </span>
              <button 
                onClick={handleSignOut}
                className={s.signOutBtn}
              >
                Sign Out
              </button>
            </div>
          ) : (
            // Show navigation when not logged in
            <>
              <a href="#how-it-works" className={s.navLink}>
                How It Works
              </a>
              <a href="#about" className={s.navLink}>
                About
              </a>
              <a href="#contact" className={s.navLink}>
                Contact
              </a>
            </>
          )}
        </nav>

        <button className={s.mobileMenuBtn} aria-label="Menu">
          <span className={s.menuIcon}></span>
          <span className={s.menuIcon}></span>
          <span className={s.menuIcon}></span>
        </button>
      </div>
    </header>
  );
}