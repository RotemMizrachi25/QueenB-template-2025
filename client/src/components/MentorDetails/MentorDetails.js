// client/src/components/MentorDetails/MentorDetails.js
// a window opens up when mentee chooses a mentor from homepage

import React, { useEffect, useState } from "react";
import { fetchMentorById } from "../../api/mentorsApi";
import s from "./MentorDetails.module.css";
import { MailIcon, PhoneIcon, WhatsappIcon, LinkedinIcon } from "../Icons";

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

function isRTL(str = "") { return /[\u0590-\u05FF\u0600-\u06FF]/.test(str); }

export default function MentorDetails({ mentorId, onClose }) {
    const [mentor, setMentor] = useState(null);
    const { user: currentUser } = useAuthUser();
    const [showWaMenu, setShowWaMenu] = useState(false);

    useEffect(() => { fetchMentorById(mentorId).then(setMentor); }, [mentorId]);

    if (!mentor) return null;

    const fullName  = [mentor.firstName, mentor.lastName].filter(Boolean).join(" ").trim() || "Mentor";
    const aboutText = mentor.about || "";

    const isRtlContext = isRTL(aboutText) || isRTL(fullName);
    const textDir      = isRtlContext ? "rtl" : "ltr";
    const layoutClass  = isRtlContext ? s.rtl : s.ltr;

    const aboutLabel   = isRtlContext ? `על ${mentor.firstName}` : `About ${mentor.firstName}`;
    const contactLabel = isRtlContext ? `צרי קשר עם ${mentor.firstName}` : `Contact ${mentor.firstName}`;
    const yearsLabel   = isRtlContext ? "שנות ניסיון" : "years of experience";

    const avatar =
        mentor.avatarUrl ||
        mentor.imageUrl ||
        mentor.image ||
        mentor.photoURL ||
        "/programmer.png";
    const mailHref = mentor.email ? `mailto:${mentor.email}` : undefined;
    const telHref  = mentor.phone ? `tel:${mentor.phone}` : undefined;
    const waHref   = mentor.phone ? `https://wa.me/${numbersOnly(mentor.phone)}` : undefined;

    

    return (
        <div className={s.backdrop} onClick={onClose}>
            <div className={`${s.panel} ${layoutClass}`} onClick={(e) => e.stopPropagation()}>
                <button className={s.close} onClick={onClose} aria-label="סגירה">✕</button>

                <img className={s.avatar} src={avatar} alt={fullName} onError={(e) => {
                        e.currentTarget.onerror = null;   // prevent infinite loop
                        e.currentTarget.src = "/programmer.png";
                }
            }
            />

                <div className={s.content} dir={textDir}>
                    <div className={s.nameRow}>
                        {mentor.linkedinUrl && (
                            <a href={mentor.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                                <LinkedinIcon />
                            </a>
                        )}
                        <div className={s.name} dir="auto">{fullName}</div>
                    </div>

                    <div className={s.head} dir={textDir}>{mentor.headlineTech}</div>

                    {typeof mentor.yearsOfExperience === "number" && (
                        <div className={s.years}>
                            {mentor.yearsOfExperience} {yearsLabel}
                        </div>
                    )}

                    {(() => {
                    const toLine = (val) =>
                        Array.isArray(val) ? val.join(", ") :
                        (typeof val === "string" ? val : "");

                    const langs = toLine(mentor.programmingLanguages);
                    const techs = toLine(mentor.technologies);
                    const domains = toLine(mentor.domains);

                    return (
                        <>
                        {langs && (
                            <div className={s.kv} dir={textDir}>
                            <span className={s.k}>{isRtlContext ? "שפות תכנות:" : "Programming languages:"}</span>
                            <span className={s.v}>{langs}</span>
                            </div>
                        )}
                        {techs && (
                            <div className={s.kv} dir={textDir}>
                            <span className={s.k}>{isRtlContext ? "טכנולוגיות:" : "Technologies:"}</span>
                            <span className={s.v}>{techs}</span>
                            </div>
                        )}
                        {domains && (
                            <div className={s.kv} dir={textDir}>
                            <span className={s.k}>{isRtlContext ? "תחומים:" : "Domains:"}</span>
                            <span className={s.v}>{domains}</span>
                            </div>
                        )}
                        </>
                    );
                    })()}


                    {!!aboutText && (() => {
                        const lines = aboutText.split("•").map(l => l.trim()).filter(Boolean);
                        return (
                            <div>
                                <div className={s.sectionTitle}>{aboutLabel}</div>
                                <ul className={s.aboutList} dir={textDir}>
                                    {lines.map((line, i) => <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        );
                    })()}

                    <div className={s.contactTitle}>{contactLabel}</div>
                    <div className={s.row}>
                        {emailHref && (
                            <a
                                className={s.iconBtn}
                                href={emailHref}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => { e.stopPropagation(); }}
                                aria-label="Email"
                            >
                                <MailIcon />
                            </a>
                        )}

                        {phoneHref && (
                            <a
                                className={s.iconBtn}
                                href={phoneHref}
                                onClick={(e) => { e.stopPropagation(); }}
                                aria-label="Phone"
                            >
                                <PhoneIcon />
                            </a>
                        )}

                        {waHrefFinal && (
                            <div className={s.waGroup} style={{ position: "relative", display: "inline-block" }}>
                                <a
                                    className={s.iconBtn}
                                    href={waHrefFinal}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowWaMenu(v => !v); }}
                                    aria-label="WhatsApp"
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
                                            zIndex: 20,
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
                        )}

                        {mentor.linkedinUrl && (
                            <a className={s.iconBtn} href={mentor.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" onClick={(e)=>e.stopPropagation()}>
                                <LinkedinIcon />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}