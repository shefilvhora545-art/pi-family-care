import { useCallback, useEffect, useState } from "react";

import { api, go } from "./api.js";
import Login from "./pages/Login.jsx";
import FamilyHome from "./pages/FamilyHome.jsx";
import NewOrder from "./pages/NewOrder.jsx";
import OrderPage from "./pages/OrderPage.jsx";
import PharmacyHome from "./pages/PharmacyHome.jsx";
import PharmacyOrder from "./pages/PharmacyOrder.jsx";
import { Logo } from "./components/ui.jsx";

// Tiny hash router: #/ , #/new , #/order/12 , #/pharmacy/order/12
function useRoute() {
    const read = () => window.location.hash.replace(/^#/, "") || "/";
    const [route, setRoute] = useState(read);
    useEffect(() => {
        const onChange = () => { setRoute(read()); window.scrollTo(0, 0); };
        window.addEventListener("hashchange", onChange);
        return () => window.removeEventListener("hashchange", onChange);
    }, []);
    return route;
}

export default function App() {
    const route = useRoute();
    const [user, setUser] = useState(undefined);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        api.get("/api/auth/me").then((data) => setUser(data.user)).catch(() => setUser(null));
        api.get("/api/config").then(setConfig).catch(() => setConfig({}));
    }, []);

    const signOut = useCallback(async () => {
        await api.post("/api/auth/logout").catch(() => {});
        setUser(null);
        go("/");
    }, []);

    if (user === undefined || !config) return <div className="boot"><Logo /></div>;
    if (!user) return <Login config={config} onSignedIn={(signed) => { setUser(signed); go("/"); }} />;

    let page;
    const orderMatch = route.match(/^\/order\/(\d+)/);
    const pharmacyOrderMatch = route.match(/^\/pharmacy\/order\/(\d+)/);
    if (user.role === "pharmacy") {
        page = pharmacyOrderMatch ? <PharmacyOrder id={pharmacyOrderMatch[1]} /> : <PharmacyHome />;
    } else if (route === "/new") {
        page = <NewOrder config={config} />;
    } else if (orderMatch) {
        page = <OrderPage id={orderMatch[1]} config={config} />;
    } else {
        page = <FamilyHome user={user} />;
    }

    return (
        <div className="shell">
            <header className="topbar">
                <a href="#/" className="topbar-brand"><Logo /></a>
                <div className="topbar-right">
                    <span className={`mode-pill ${config.aiMode === "gemini" ? "on" : ""}`} title="Which AI reads prescriptions">
                        {config.aiMode === "gemini" ? "AI: Google Gemini" : "AI: demo reader"}
                    </span>
                    <span className="topbar-user">
                        <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
                        <span className="topbar-name">{user.name}</span>
                        <span className="role-tag">{user.role === "pharmacy" ? "Pharmacy" : "Family"}</span>
                    </span>
                    <button className="btn ghost small" onClick={signOut}>Sign out</button>
                </div>
            </header>
            <main className="main">{page}</main>
            <footer className="footer">
                PI Family Care · Payments by PayPal (sandbox) · Prescriptions read by Google Gemini · Open source (MIT)
            </footer>
        </div>
    );
}
