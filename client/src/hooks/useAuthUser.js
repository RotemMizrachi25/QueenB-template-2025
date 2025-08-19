// client/src/hooks/useAuthUser.js
// Small reusable hook to fetch the logged-in user from /api/auth/me
// and return { user, loading }. Uses cookies via credentials: "include".

import { useEffect, useState } from "react";

export default function useAuthUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancel = false;

        fetch("/api/auth/me", { credentials: "include" })
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((data) => {
                if (!cancel && data?.authenticated && data?.user) {
                    setUser(data.user); // { firstName, lastName, email, userType, id }
                }
            })
            .catch(() => {})
            .finally(() => {
                if (!cancel) setLoading(false);
            });

        return () => { cancel = true; };
    }, []);

    return { user, loading };
}