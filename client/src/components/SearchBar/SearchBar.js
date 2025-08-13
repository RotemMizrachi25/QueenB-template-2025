// client/src/components/SearchBar/SearchBar.js

import React, { useState } from "react";
import s from "./SearchBar.module.css";

function isRTL(str = "") {
    return /[\u0590-\u05FF\u0600-\u06FF]/.test(str);
}

export default function SearchBar({ initialQuery = "", onSearch }) {
    const [q, setQ] = useState(initialQuery);

    // Empty input → RTL (placeholder is Hebrew). Otherwise detect by content.
    const inputDir = q.trim() === "" ? "rtl" : (isRTL(q) ? "rtl" : "ltr");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch && onSearch(q);
    };

    return (
        <form className={s.wrap} onSubmit={handleSubmit}>
            <input
                className={s.input}
                placeholder="חפשי מנטורית לפי שם או מקצוע"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                dir={inputDir}
            />
            <button className={s.button} type="submit">חיפוש</button>
        </form>
    );
}