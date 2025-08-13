// client/src/components/MentorGrid/MentorGrid.js

import React from "react";
import MentorCard from "../MentorCard/MentorCard";
import s from "./MentorGrid.module.css";

/**
 * Simple responsive grid of mentor cards.
 * Props:
 *  - mentors: Array of mentor objects
 *  - onSelect: function(mentor) -> void
 */
export default function MentorGrid({ mentors, onSelect }) {
    return (
        <div className={s.grid}>
            {mentors.map((m) => (
                <MentorCard key={m.id} mentor={m} onClick={onSelect} />
            ))}
        </div>
    );
}