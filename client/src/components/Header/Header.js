// client/src/components/Header/Header.js

import React from "react";
import s from "./Header.module.css";

export default function Header() {
    return (
        <header className={s.bar}>
            <span className={s.crown} aria-hidden>👑</span>
            <span className={s.title}>Queens Match</span>
        </header>
    );
}