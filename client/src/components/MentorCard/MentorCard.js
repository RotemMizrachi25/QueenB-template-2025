// client/src/components/MentorCard/MentorCard.js
// small box of each mentor in the homepage

import React, { useState } from "react";
import s from "./MentorCard.module.css";
import { MailIcon, WhatsappIcon } from "../Icons";

import {
    toE164NoPlusIL,
    buildEmailTemplate,
    buildWhatsappTemplate,
    gmailComposeHref,
    waHref,
    openWhatsAppWeb,
    openWhatsAppApp,
} from "../../utils/contactTemplates";

import useAuthUser from "../../hooks/useAuthUser";

function isRTL(str = "") {
    return /[\u0590-\u05FF\u0600-\u06FF]/.test(str);
}

export default function MentorCard({ mentor, onClick }) {
    const fullName = `${mentor.firstName} ${mentor.lastName}`.trim();
    const avatar =
        mentor.avatarUrl ||
        mentor.imageUrl ||
        mentor.image ||
        mentor.photoURL ||
        "/programmer.png";
    const cardDir = isRTL(fullName) ? "rtl" : "ltr";
    const yearsLabel = isRTL(fullName) ? "שנות ניסיון" : "years of experience";

    // Decide what to display for years of experience
    let yearsText = "";
    if (mentor.yearsOfExperience === 1) {
    yearsText = isRTL(fullName)
        ? "שנת ניסיון אחת"
        : "one year of experience";
    } else if (typeof mentor.yearsOfExperience === "number") {
    yearsText = `${mentor.yearsOfExperience} ${yearsLabel}`;
    }

    // Use keyboard accessibility when using a non-button element with role="button"
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick && onClick(mentor);
        }
    };

    const menteeName = currentUser?.firstName || "Mentee";
    const { subject, body } = buildEmailTemplate({ mentorFirstName:
            mentor?.firstName || "Mentor", menteeName });
    const waText = buildWhatsappTemplate({ mentorFirstName: mentor?.firstName
            || "Mentor", menteeName });

    const hasEmail = Boolean(mentor?.email);
    const gmailLink = hasEmail ? gmailComposeHref(
        { to: mentor.email, subject, body }) : null;

    const rawPhone = mentor?.phoneNumber || mentor?.phone;
    const hasPhone = Boolean(rawPhone);
    const phoneE164NoPlus = hasPhone ? toE164NoPlusIL(rawPhone) : "";
    const waLink = hasPhone && phoneE164NoPlus ? waHref(phoneE164NoPlus, waText) : null;

    return (
        <div
            className={s.card}
            role="button"
            tabIndex={0}
            aria-label={fullName}
            onClick={() => onClick && onClick(mentor)}
            onKeyDown={handleKeyDown}
            dir={cardDir}
        >
            {/* The CSS can flip columns using .card:dir(rtl) if needed */}
            <img className={s.avatar} src={avatar} alt={fullName} onError={(e) => {
                                    e.currentTarget.onerror = null;   // prevent infinite loop
                                    e.currentTarget.src = "/programmer.png";
                            }
                        }
                        />
            <div className={s.text}>
                <div className={s.name} dir="auto">{fullName}</div>
                <div className={s.tech} dir="auto">{mentor.headlineTech}</div>
                {typeof mentor.yearsOfExperience === "number" && (
                    <div className={s.years} dir={cardDir}>
                         {yearsText}
                    </div>
                )}

                <div className={s.actions}>
                    <a
                        className={`${s.iconBtn} ${gmailLink ? "" : s.disabled}`}
                        href={gmailLink || undefined}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!gmailLink) e.preventDefault();
                        }}
                        aria-disabled={!gmailLink}
                        aria-label="Email"
                        title={gmailLink ? "Email" : "No email available"}
                    >
                        <MailIcon />
                    </a>

                    {/* WhatsApp with choice: Web/App */}
                    <div className={s.waGroup} style={{ position: "relative", display: "inline-block" }}>
                        <a
                            className={`${s.iconBtn} ${waLink ? "" : s.disabled}`}
                            href={waLink || undefined}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!waLink) { e.preventDefault(); return; }
                                e.preventDefault();
                                setShowWaMenu(v => !v);
                            }}
                            aria-disabled={!waLink}
                            aria-label="WhatsApp"
                            title={waLink ? "WhatsApp" : "No phone available"}
                        >
                            <WhatsappIcon />
                        </a>

                        {showWaMenu && (
                            <div
                                role="menu"
                                className={s.waMenu}
                                style={{
                                    position: "absolute",
                                    top: "48px",
                                    insetInlineStart: 0,
                                    background: "#fff",
                                    border: "1px solid #f1d3da",
                                    borderRadius: 10,
                                    boxShadow: "0 6px 18px rgba(0,0,0,.12)",
                                    padding: 8,
                                    zIndex: 10,
                                    minWidth: 160
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await openWhatsAppWeb(phoneE164NoPlus, waText);
                                        setShowWaMenu(false);
                                    }}
                                    style={{ display: "block", width: "100%", background: "transparent", border: "none", padding: "8px 10px", cursor: "pointer", textAlign: "start" }}
                                >
                                    Open in Web
                                </button>
                                <button
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await openWhatsAppApp(phoneE164NoPlus, waText);
                                        setShowWaMenu(false);
                                    }}
                                    style={{ display: "block", width: "100%", background: "transparent", border: "none", padding: "8px 10px", cursor: "pointer", textAlign: "start" }}
                                >
                                    Open in App
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}