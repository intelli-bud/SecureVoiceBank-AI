import {
    Shield,
    LayoutDashboard,
    AudioLines,
    Mic,
    Phone,
    History,
    BarChart3,
    Settings,
} from "lucide-react";

const navigation = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Analyze Audio",
        icon: AudioLines,
    },
    {
        label: "Live Voice",
        icon: Mic,
    },
    {
        label: "VoIP Monitor",
        icon: Phone,
    },
    {
        label: "History",
        icon: History,
    },
    {
        label: "Analytics",
        icon: BarChart3,
    },
];

function Sidebar({ currentPage, onNavigate, isOpen }) {
    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>

            <div className="brand">

                <div className="brand-icon">
                    <Shield size={22} />
                </div>

                <div>
                    <div className="brand-name">
                        SecureVoiceBank
                    </div>

                    <div className="brand-subtitle">
                        VOICE SECURITY
                    </div>
                </div>

            </div>


            <div className="nav-section">

                <div className="nav-title">
                    MONITORING
                </div>

                {navigation.map((item) => {

                    const Icon = item.icon;

                    return (
                        <button
                            type="button"
                            key={item.label}
                            className={`nav-item ${currentPage === item.label ? "active" : ""
                                }`}
                            aria-current={currentPage === item.label ? "page" : undefined}
                            onClick={() => onNavigate(item.label)}
                        >

                            <Icon size={18} />

                            <span>
                                {item.label}
                            </span>

                        </button>
                    );

                })}

            </div>


            <div className="sidebar-bottom">

                <button
                    type="button"
                    className={`nav-item ${currentPage === "Settings" ? "active" : ""
                        }`}
                    aria-current={currentPage === "Settings" ? "page" : undefined}
                    onClick={() => onNavigate("Settings")}
                >

                    <Settings size={18} />

                    <span>
                        Settings
                    </span>

                </button>


                <div className="system-status">

                    <span className="status-dot" />

                    <div>

                        <div className="status-title">
                            VOICE SECURITY
                        </div>

                        <div className="status-subtitle">
                            SecureVoiceBank console
                        </div>

                    </div>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;