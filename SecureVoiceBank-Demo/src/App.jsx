import { useEffect, useState } from "react";
import { ChevronRight, Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Signup from "./components/Signup";
import Login from "./components/Login";
import AudioAnalyzer from "./components/AudioAnalyzer";
import LiveDetector from "./components/LiveDetector";
import VoIPDetector from "./components/VoIPDetector";

import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";

import { getHistory } from "./utils/history";
import { getStorageItem, setStorageItem } from "./utils/storage";


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return (
            getStorageItem("securevoicebank_auth") === "true" ||
            getStorageItem("securevoicebank_auth", sessionStorage) === "true"
        );
    });

    const [authPage, setAuthPage] = useState("login");

    const [currentPage, setCurrentPage] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [history, setHistory] = useState([]);

    const handleNavigate = (page) => {
        setCurrentPage(page);
        setSidebarOpen(false);
    };

    const handleLogin = ({ email, password, rememberMe }) => {
        const storedAccount = getStorageItem("securevoicebank_account");

        if (!storedAccount) {
            setAuthPage("signup");
            return {
                success: false,
                error: "No account found. Please create an account first.",
            };
        }

        const account = JSON.parse(storedAccount);

        if (
            account.email.toLowerCase() !== email.toLowerCase() ||
            account.password !== password
        ) {
            return {
                success: false,
                error: "Invalid email or password.",
            };
        }

        const storage = rememberMe ? localStorage : sessionStorage;

        setStorageItem("securevoicebank_auth", "true", storage);
        setStorageItem("securevoicebank_user_email", account.email, storage);
        setStorageItem("securevoicebank_user_name", account.name, storage);

        setIsAuthenticated(true);

        return {
            success: true,
        };
    };

    const handleSignup = ({ name, email, password }) => {
        setStorageItem(
            "securevoicebank_account",
            JSON.stringify({
                name,
                email,
                password,
            })
        );

        setAuthPage("login");
    };

    useEffect(() => {
        const refreshHistory = () => {
            setHistory(getHistory());
        };

        refreshHistory();

        window.addEventListener(
            "securevoicebank-history-updated",
            refreshHistory
        );

        return () => {
            window.removeEventListener(
                "securevoicebank-history-updated",
                refreshHistory
            );
        };
    }, []);

    if (!isAuthenticated) {
        if (authPage === "signup") {
            return (
                <Signup
                    onSignup={handleSignup}
                    onBackToLogin={() => setAuthPage("login")}
                />
            );
        }

        return (
            <Login
                onLogin={handleLogin}
                onCreateAccount={() => setAuthPage("signup")}
            />
        );
    }

    return (
        <div className="app-layout">

            <button
                type="button"
                className="mobile-nav-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
            >
                <Menu size={20} />
            </button>

            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                isOpen={sidebarOpen}
            />

            <main className="main-content">
                <nav className="workspace-context" aria-label="Breadcrumb">
                    <span>SECUREVOICEBANK</span>
                    <ChevronRight size={13} aria-hidden="true" />
                    <strong aria-current="page">{currentPage}</strong>
                    <span className="workspace-context-tag">VOICE SECURITY CONSOLE</span>
                </nav>

                {currentPage === "VoIP Monitor" ? (

                    <VoIPDetector />

                ) : currentPage === "Analyze Audio" ? (

                    <section className="analyzer-card">

                        <div className="analyzer-header">

                            <div>

                                <div className="card-eyebrow">
                                    NEW ANALYSIS
                                </div>

                                <h2>
                                    Analyze a voice recording
                                </h2>

                                <p>
                                    Upload an audio file to inspect its
                                    authenticity and detect synthetic speech.
                                </p>

                            </div>

                        </div>

                        <AudioAnalyzer />

                    </section>

                ) : currentPage === "Live Voice" ? (

                    <section className="analyzer-card">

                        <LiveDetector />

                    </section>

                ) : currentPage === "History" ? (

                    <History />

                ) : currentPage === "Analytics" ? (

                    <Analytics />

                ) : currentPage === "Settings" ? (

                    <Settings />

                ) : (

                    <Dashboard history={history} />
                )}

            </main>

        </div>
    );
}

export default App;