// client/src/components/MentorDetails/MentorDetails.js
// a window opens up when mentee chooses a mentor from homepage

import React, { useEffect, useState } from "react";
import { fetchMentorById } from "../../api/mentorsApi";
import s from "./MentorDetails.module.css";
import { MailIcon, PhoneIcon, WhatsappIcon, LinkedinIcon } from "../Icons";

// Detect RTL (Hebrew/Arabic)
function isRTL(str = "") {
    return /[\u0590-\u05FF\u0600-\u06FF]/.test(str);
}

// Keep only digits (WhatsApp)
function numbersOnly(x) {
    return (x || "").replace(/[^\d]/g, "");
}

export default function MentorDetails({ mentorId, onClose }) {
    const [mentor, setMentor] = useState(null);

    useEffect(() => {
        fetchMentorById(mentorId).then(setMentor);
    }, [mentorId]);

    if (!mentor) return null;

    const fullName  = `${mentor.firstName} ${mentor.lastName}`.trim();
    const aboutText = mentor.about || "";

    // RTL context if the description or the name is Hebrew/Arabic
    const isRtlContext = isRTL(aboutText) || isRTL(fullName);
    const textDir      = isRtlContext ? "rtl" : "ltr"; // for alignment inside blocks
    const layoutClass  = isRtlContext ? s.rtl : s.ltr; // flips avatar/content sides

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
            {/* layoutClass controls where the image sits (right for RTL, left for LTR) */}
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

                    {/* Force headline to follow the page direction (right in RTL, left in LTR) */}
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
                        {mailHref && <a className={s.iconBtn} href={mailHref} aria-label="Email"><MailIcon /></a>}
                        {telHref  && <a className={s.iconBtn} href={telHref}  aria-label="Phone"><PhoneIcon /></a>}
                        {waHref   && <a className={s.iconBtn} href={waHref}   aria-label="WhatsApp"><WhatsappIcon /></a>}
                        {mentor.linkedinUrl && (
                            <a className={s.iconBtn} href={mentor.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                                <LinkedinIcon />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}