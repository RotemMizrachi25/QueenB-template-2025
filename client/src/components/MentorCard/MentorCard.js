// client/src/components/MentorCard/MentorCard.js

import React from "react";
import s from "./MentorCard.module.css";

// Heuristic: detect RTL languages (Heb/Arabic) to control card direction
function isRTL(str = "") {
    return /[\u0590-\u05FF\u0600-\u06FF]/.test(str);
}

/**
 * Lightweight card for showing a mentor in the grid.
 * Props:
 *  - mentor: { firstName, lastName, headlineTech, yearsOfExperience, avatarUrl }
 *  - onClick: function(mentor)  // optional
 */
export default function MentorCard({ mentor, onClick }) {
    const fullName = `${mentor.firstName} ${mentor.lastName}`.trim();
    const avatar = mentor.avatarUrl || "/avatars/default-female.png";
    const cardDir = isRTL(fullName) ? "rtl" : "ltr";
    const yearsLabel = isRTL(fullName) ? "שנות ניסיון" : "years of experience";

    // Use keyboard accessibility when using a non-button element with role="button"
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick && onClick(mentor);
        }
    };

    return (
        <div
            className={s.card}
            role="button"
            tabIndex={0}
            aria-label={fullName}
            onClick={() => onClick && onClick(mentor)}
            onKeyDown={handleKeyDown}
            dir={cardDir}         // logical layout & text direction
        >
            {/* The CSS can flip columns using .card:dir(rtl) if needed */}
            <img className={s.avatar} src={avatar} alt={fullName} />
            <div className={s.text}>
                <div className={s.name} dir="auto">{fullName}</div>
                <div className={s.tech} dir="auto">{mentor.headlineTech}</div>
                {typeof mentor.yearsOfExperience === "number" && (
                    <div className={s.years} dir={cardDir}>
                        {mentor.yearsOfExperience} {yearsLabel}
                    </div>
                )}
            </div>
        </div>
    );
}