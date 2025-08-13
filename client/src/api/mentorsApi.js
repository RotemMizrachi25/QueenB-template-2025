// client/src/api/mentorsApi.js

// If you have a real backend, set REACT_APP_API_BASE_URL in client/.env
// Example: REACT_APP_API_BASE_URL=http://localhost:5000/api
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

/** ---------------------------------------------
 * Normalize server objects to the shape the UI expects
 * --------------------------------------------- */
function normalizeMentor(u) {
    return {
        id: String(u.id || u._id || ""),
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        headlineTech:
            (u.headlineTech && String(u.headlineTech).toUpperCase()) ||
            (Array.isArray(u.technologies) && u.technologies[0] && String(u.technologies[0]).toUpperCase()) ||
            (Array.isArray(u.programmingLanguages) && u.programmingLanguages[0] && String(u.programmingLanguages[0]).toUpperCase()) ||
            (Array.isArray(u.domains) && u.domains[0] && String(u.domains[0]).toUpperCase()) ||
            "JAVASCRIPT",
        yearsOfExperience: Number(u.yearsOfExperience || 0),
        about: u.generalDescription || u.about || "",
        email: u.email || undefined,
        phone: u.phoneNumber || u.phone || undefined,
        linkedinUrl: u.linkedinUrl || u.linkedin || undefined,
        avatarUrl: u.avatarUrl || u.avatar || u.photoUrl || u.picture || undefined,
        tags: Array.isArray(u.technologies)
            ? u.technologies
            : Array.isArray(u.programmingLanguages)
                ? u.programmingLanguages
                : Array.isArray(u.domains)
                    ? u.domains
                    : Array.isArray(u.tags)
                        ? u.tags
                        : [],
    };
}

/**
 * Local mock data for development without a backend.
 * Add more items if you want a richer grid.
 */
const mock = [
    {
        id: "1",
        firstName: "נועה",
        lastName: "קירל",
        headlineTech: "JAVASCRIPT",
        yearsOfExperience: 3,
        about:
            "בוגרת תואר במדעי המחשב 2022 • מפתחת בדאטה ב-AppsFlyer • אוהבת פייתון, לולאות וקפה",
        email: "noa@example.com",
        phone: "+972501112233",
        linkedinUrl: "https://www.linkedin.com/in/noa",
        avatarUrl: "/avatars/default-female.png",
        tags: ["JAVASCRIPT", "HTML", "CSS", "REACT"],
    },
    {
        id: "2",
        firstName: "אגם",
        lastName: "בוחבוט",
        headlineTech: "HTML",
        yearsOfExperience: 4,
        about: "מפתחת פרונט • אוהבת עיצוב, קומפוננטות וקפה לאטה",
        email: "angel@example.com",
        phone: "+972502224444",
        linkedinUrl: "https://www.linkedin.com/in/angel",
        avatarUrl: "/avatars/default-female.png",
        tags: ["HTML", "CSS", "JS"]
    },
    {
        id: "3",
        firstName: "אנה",
        lastName: "זק",
        headlineTech: "REACT",
        yearsOfExperience: 2,
        about: "בונה SPA ב-React • אוהבת Hooks, Zustand ורספונסיביות",
        email: "carrie@example.com",
        phone: "+972503336666",
        linkedinUrl: "https://www.linkedin.com/in/carrie",
        avatarUrl: "/avatars/default-female.png",
        tags: ["REACT", "JAVASCRIPT", "CSS"]
    },
    {
        id: "4",
        firstName: "נינט",
        lastName: "טייב",
        headlineTech: "CSS",
        yearsOfExperience: 5,
        about: "מומחית CSS • Grid, Flexbox, אנימציות • עוזרת לליטוש UI",
        email: "ginet@example.com",
        phone: "+972504447777",
        linkedinUrl: "https://www.linkedin.com/in/ginet",
        avatarUrl: "/avatars/default-female.png",
        tags: ["CSS", "UI", "ANIMATION"]
    }
];

/**
 * Fetch mentors list.
 * Falls back to mock when BASE_URL is empty.
 */
export async function fetchMentors(params = {}) {
    if (!BASE_URL) {
        // Basic client-side search/filter on mock data
        const q = (params.q || "").trim().toLowerCase();
        const tech = (params.tech || "").trim().toLowerCase();

        return mock.filter((m) => {
            const hay = `${m.firstName} ${m.lastName} ${m.headlineTech} ${(m.tags || []).join(" ")}`
                .toLowerCase();
            const passQ = q ? hay.includes(q) : true;
            const passTech = tech ? hay.includes(tech) : true;
            return passQ && passTech;
        });
    }

    const path = params.q ? "/mentors/search" : "/mentors";
    const url = new URL(`${BASE_URL}${path}`);
    if (params.q) url.searchParams.set("q", params.q);
    if (params.tech) url.searchParams.set("tech", params.tech);

    /** ---------------------------------------------
     * Include credentials for session-based auth
     * --------------------------------------------- */
    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to load mentors: ${res.status}`);

    /** ---------------------------------------------
     * Unwrap server response and normalize items
     * Server might return { mentors: [...] } instead of a bare array
     * --------------------------------------------- */
    const json = await res.json();
    const list = Array.isArray(json) ? json : json.mentors;
    if (!Array.isArray(list)) return [];
    return list.map(normalizeMentor);
}

/**
 * Fetch a single mentor by id.
 * Falls back to mock when BASE_URL is empty.
 */
export async function fetchMentorById(id) {
    if (!BASE_URL) {
        return mock.find((m) => m.id === id) || null;
    }

    /** ---------------------------------------------
     * Include credentials for session-based auth
     * --------------------------------------------- */
    const res = await fetch(`${BASE_URL}/mentors/${id}`, { credentials: "include" });
    if (!res.ok) return null;

    /** ---------------------------------------------
     * Unwrap server response and normalize the object
     * Server might return { mentor: {...} } instead of a bare object
     * --------------------------------------------- */
    const json = await res.json();
    const item = json.mentor || json;
    return item ? normalizeMentor(item) : null;
}