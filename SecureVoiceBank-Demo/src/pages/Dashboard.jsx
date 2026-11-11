import { useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Phone,
    ShieldAlert,
} from "lucide-react";

import AudioAnalyzer from "../components/AudioAnalyzer";
import LiveDetector from "../components/LiveDetector";

function formatProbability(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    const percentage = number <= 1
        ? number * 100
        : number;

    return `${Math.min(percentage, 100).toFixed(1)}%`;
}

function formatRelativeTime(timestamp) {
    if (!timestamp) {
        return "Unknown time";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Unknown time";
    }

    const diffSeconds = Math.floor(
        (Date.now() - date.getTime()) / 1000
    );

    if (diffSeconds < 60) {
        return "Just now";
    }

    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
        return `${diffHours} hr ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 7) {
        return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    }

    return date.toLocaleDateString();
}

function getDailyActivity(history) {
    const activityByDay = new Map();

    history.forEach((entry) => {
        const timestamp = new Date(entry.timestamp);

        if (Number.isNaN(timestamp.getTime())) {
            return;
        }

        const day = new Date(
            timestamp.getFullYear(),
            timestamp.getMonth(),
            timestamp.getDate()
        );
        const key = [
            day.getFullYear(),
            String(day.getMonth() + 1).padStart(2, "0"),
            String(day.getDate()).padStart(2, "0"),
        ].join("-");
        const current = activityByDay.get(key) || { day, count: 0 };
        current.count += 1;
        activityByDay.set(key, current);
    });

    return [...activityByDay.values()]
        .sort((left, right) => left.day - right.day)
        .slice(-7);
}

function ActivityChart({ activity }) {
    if (activity.length === 0) {
        return (
            <div className="security-chart-empty">
                Analysis activity will appear here after results are saved.
            </div>
        );
    }

    const width = 560;
    const height = 152;
    const paddingX = 12;
    const paddingTop = 16;
    const baseline = 126;
    const maxCount = Math.max(...activity.map((point) => point.count), 1);
    const points = activity.map((point, index) => {
        const x = activity.length === 1
            ? width / 2
            : paddingX + (index * (width - paddingX * 2)) / (activity.length - 1);
        const y = baseline - (point.count / maxCount) * (baseline - paddingTop);

        return { ...point, x, y };
    });
    const line = points.map((point) => `${point.x},${point.y}`).join(" ");
    const area = `${points[0].x},${baseline} ${line} ${points[points.length - 1].x},${baseline}`;

    return (
        <div className="security-chart">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={`Saved security activity by day: ${activity
                    .map((point) => `${point.day.toLocaleDateString()}, ${point.count} events`)
                    .join("; ")}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="activity-chart-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[42, 84, baseline].map((y) => (
                    <line
                        key={y}
                        x1="0"
                        x2={width}
                        y1={y}
                        y2={y}
                        className="security-chart-gridline"
                    />
                ))}
                <polygon points={area} fill="url(#activity-chart-fill)" />
                {points.length > 1 && (
                    <polyline
                        points={line}
                        fill="none"
                        className="security-chart-line"
                    />
                )}
                {points.map((point) => (
                    <circle
                        key={point.day.toISOString()}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        className="security-chart-point"
                    >
                        <title>
                            {point.day.toLocaleDateString()}: {point.count} event{point.count === 1 ? "" : "s"}
                        </title>
                    </circle>
                ))}
            </svg>
            <div className="security-chart-labels" aria-hidden="true">
                {points.map((point) => (
                    <span key={point.day.toISOString()}>
                        {point.day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                ))}
            </div>
        </div>
    );
}

function Dashboard({ history }) {
    const [backendStatus, setBackendStatus] =
        useState("checking");

    useEffect(() => {
        let mounted = true;

        const checkBackend = async () => {
            try {
                const response = await fetch(
                    "https://unsubscribe-geology-smtp-christ.trycloudflare.com/api/health",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Backend returned ${response.status}`
                    );
                }

                if (mounted) {
                    setBackendStatus("online");
                }
            } catch (error) {
                console.warn(
                    "SECUREVOICEBANK backend health check failed:",
                    error
                );

                if (mounted) {
                    setBackendStatus("offline");
                }
            }
        };

        checkBackend();

        const interval = setInterval(
            checkBackend,
            10000
        );

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    const safeHistory = Array.isArray(history) ? history : [];
    const activity = getDailyActivity(safeHistory);

    const voiceAnalyses = safeHistory.filter(
        (entry) => entry.source !== "VoIP Monitor"
    );

    const aiDetections = voiceAnalyses.filter(
        (entry) => entry.verdict === "AI"
    );

    const genuineDetections = voiceAnalyses.filter(
        (entry) => entry.verdict === "GENUINE"
    );

    const callShieldEntries = safeHistory.filter(
        (entry) =>
            entry.source === "VoIP Monitor" &&
            entry.callShieldRiskLevel
    );

    const highRiskCalls = callShieldEntries.filter((entry) =>
        ["HIGH", "CRITICAL"].includes(
            String(entry.callShieldRiskLevel).toUpperCase()
        )
    );

    const latestCallShield = callShieldEntries[0];

    const latestVoice = voiceAnalyses[0];

    const genuinePercent =
        voiceAnalyses.length > 0
            ? (genuineDetections.length / voiceAnalyses.length) * 100
            : 0;

    const latestRiskLevel = latestCallShield
        ? String(
            latestCallShield.callShieldRiskLevel
        ).toUpperCase()
        : "NO DATA";

    const latestRiskScore = latestCallShield
        ? Number(
            latestCallShield.callShieldRiskScore || 0
        )
        : 0;

    return (
        <div className="dashboard-page dashboard-page-redesigned">
            <header className="top-header">
                <div>
                    <div className="page-eyebrow">
                        SECUREVOICEBANK SECURITY CONSOLE
                    </div>

                    <h1 className="page-title">
                        Security Dashboard
                    </h1>

                    <p className="page-description">
                        Monitor voice authenticity, detect synthetic speech, and track conversation security.
                    </p>
                </div>

                <div
                    className={`system-pill ${backendStatus === "offline"
                        ? "backend-offline"
                        : backendStatus === "checking"
                            ? "backend-checking"
                            : ""
                        }`}
                >
                    <span className="status-dot" />

                    {backendStatus === "online"
                        ? "SYSTEM ONLINE"
                        : backendStatus === "checking"
                            ? "CHECKING SYSTEM"
                            : "BACKEND OFFLINE"}
                </div>
            </header>

                        <div className="dashboard-layout">
                            <div className="dashboard-primary">
                                <section className="security-overview-card" aria-labelledby="security-overview-title">
                                    <div className="security-overview-heading">
                                        <div>
                                            <span className="security-overview-eyebrow">SECURITY OVERVIEW</span>
                                            <h2 id="security-overview-title">Security activity</h2>
                                            <p>Saved voice and conversation analysis results over time.</p>
                                        </div>
                                        <span className="overview-history-count">
                                            {safeHistory.length} saved event{safeHistory.length === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                    <ActivityChart activity={activity} />
                                </section>

                                <section className="securevoicebank-dashboard-stats" aria-label="Security metrics">
                                    <article className="securevoicebank-dashboard-stat metric-total">
                                        <div className="securevoicebank-stat-icon">
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <span>TOTAL ANALYSES</span>
                                            <strong>{voiceAnalyses.length}</strong>
                                            <small>Completed voice checks</small>
                                        </div>
                                    </article>

                                    <article className="securevoicebank-dashboard-stat threat metric-ai">
                                        <div className="securevoicebank-stat-icon">
                                            <ShieldAlert size={18} />
                                        </div>
                                        <div>
                                            <span>AI VOICES DETECTED</span>
                                            <strong>{aiDetections.length}</strong>
                                            <small>Synthetic voice results</small>
                                        </div>
                                    </article>

                                    <article className="securevoicebank-dashboard-stat metric-genuine">
                                        <div className="securevoicebank-stat-icon">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div>
                                            <span>GENUINE VOICES</span>
                                            <strong>{genuineDetections.length}</strong>
                                            <small>Classified genuine results</small>
                                        </div>
                                    </article>

                                    <article className="securevoicebank-dashboard-stat threat metric-conversation">
                                        <div className="securevoicebank-stat-icon">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <span>CONVERSATION THREATS</span>
                                            <strong>{highRiskCalls.length}</strong>
                                            <small>High or critical CallShield calls</small>
                                        </div>
                                    </article>
                                </section>

                                <section className="securevoicebank-security-grid" aria-label="Security services">
                                    <article className="securevoicebank-security-card voice-authenticity-card">
                                        <div className="securevoicebank-card-header">
                                            <div>
                                                <div className="card-eyebrow">VOICE AUTHENTICITY</div>
                                                <h2>DF-Arena 1B</h2>
                                            </div>
                                            <span className="service-label">VOICE ANALYSIS</span>
                                        </div>
                                        <div className="voice-share-row">
                                            <div>
                                                <div className="securevoicebank-security-main-value">
                                                    {voiceAnalyses.length > 0
                                                        ? `${genuinePercent.toFixed(1)}%`
                                                        : "—"}
                                                </div>
                                                <div className="securevoicebank-security-label">Genuine voice share</div>
                                            </div>
                                            <div className="voice-check-total">
                                                <span>COMPLETED CHECKS</span>
                                                <strong>{voiceAnalyses.length}</strong>
                                            </div>
                                        </div>
                                        <div
                                            className="securevoicebank-progress"
                                            role="progressbar"
                                            aria-label="Genuine voice share"
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                            aria-valuenow={voiceAnalyses.length ? genuinePercent : undefined}
                                        >
                                            {voiceAnalyses.length > 0 && (
                                                <div style={{ width: `${Math.min(genuinePercent, 100)}%` }} />
                                            )}
                                        </div>
                                        <div className="securevoicebank-security-details">
                                            <div>
                                                <span>AI detected</span>
                                                <strong className="danger-text">{aiDetections.length}</strong>
                                            </div>
                                            <div>
                                                <span>Genuine</span>
                                                <strong className="success-text">{genuineDetections.length}</strong>
                                            </div>
                                        </div>
                                        {latestVoice ? (
                                            <div className="securevoicebank-latest-result">
                                                <span>Latest result</span>
                                                <strong>{latestVoice.verdict === "AI" ? "AI DETECTED" : "GENUINE VOICE"}</strong>
                                                <small>{formatRelativeTime(latestVoice.timestamp)}</small>
                                            </div>
                                        ) : (
                                            <div className="service-empty-note">
                                                Completed voice analysis results will appear here.
                                            </div>
                                        )}
                                    </article>

                                    <article className="securevoicebank-security-card callshield-dashboard-card">
                                        <div className="securevoicebank-card-header">
                                            <div>
                                                <div className="card-eyebrow">CONVERSATION SECURITY</div>
                                                <h2>CallShield</h2>
                                            </div>
                                            <span
                                                className={`securevoicebank-risk-badge ${latestCallShield
                                                    ? latestRiskLevel.toLowerCase()
                                                    : "none"
                                                    }`}
                                            >
                                                {latestRiskLevel}
                                            </span>
                                        </div>
                                        {latestCallShield ? (
                                            <>
                                                <div className="securevoicebank-risk-score">
                                                    <strong>{latestRiskScore}</strong>
                                                    <span>/ 100</span>
                                                </div>
                                                <div className="securevoicebank-security-label">Latest conversation risk</div>
                                                <div
                                                    className="securevoicebank-risk-bar"
                                                    role="progressbar"
                                                    aria-label="Latest conversation risk"
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                    aria-valuenow={Math.min(latestRiskScore, 100)}
                                                >
                                                    <div
                                                        className={
                                                            latestRiskLevel === "CRITICAL" || latestRiskLevel === "HIGH"
                                                                ? "danger"
                                                                : ""
                                                        }
                                                        style={{ width: `${Math.min(latestRiskScore, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="securevoicebank-callshield-meta">
                                                    <div>
                                                        <span>Calls analyzed</span>
                                                        <strong>{callShieldEntries.length}</strong>
                                                    </div>
                                                    <div>
                                                        <span>High / Critical</span>
                                                        <strong className="danger-text">{highRiskCalls.length}</strong>
                                                    </div>
                                                </div>
                                                {latestCallShield.callShieldReasons?.length > 0 && (
                                                    <div
                                                        className={`securevoicebank-dashboard-threat ${latestRiskLevel === "LOW"
                                                            ? "low"
                                                            : latestRiskLevel === "MEDIUM"
                                                                ? "medium"
                                                                : "high"
                                                            }`}
                                                    >
                                                        <span>
                                                            {latestRiskLevel === "LOW"
                                                                ? "LATEST ASSESSMENT"
                                                                : latestRiskLevel === "MEDIUM"
                                                                    ? "RISK INDICATOR"
                                                                    : "KEY THREAT"}
                                                        </span>
                                                        <p>{latestCallShield.callShieldReasons[0]}</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="securevoicebank-no-callshield">
                                                <div><CheckCircle2 size={18} /></div>
                                                <h3>No conversation results yet</h3>
                                                <p>Saved CallShield risk assessments will appear here after monitored calls.</p>
                                            </div>
                                        )}
                                    </article>
                                </section>

                                <section className="dashboard-action-grid" aria-label="Voice analysis tools">
                                    <section className="analyzer-card">
                                        <div className="analyzer-header">
                                            <div>
                                                <div className="card-eyebrow">NEW ANALYSIS</div>
                                                <h2>Analyze a voice recording</h2>
                                                <p>Upload an audio file to inspect its authenticity and detect synthetic speech.</p>
                                            </div>
                                        </div>
                                        <AudioAnalyzer />
                                    </section>
                                    <section className="analyzer-card">
                                        <LiveDetector />
                                    </section>
                                </section>
                            </div>

                            <aside className="dashboard-aside" aria-label="System status and recent security activity">
                                <section className="dashboard-service-card">
                                    <div className="aside-card-heading">
                                        <div>
                                            <span className="card-eyebrow">SERVICE HEALTH</span>
                                            <h2>Backend API</h2>
                                        </div>
                                        <span
                                            className={`service-health-indicator ${backendStatus}`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className={`service-health-status ${backendStatus}`}>
                                        {backendStatus === "online"
                                            ? "Connected"
                                            : backendStatus === "checking"
                                                ? "Checking connection"
                                                : "Unavailable"}
                                    </div>
                                    <p>
                                        {backendStatus === "online"
                                            ? "The configured health endpoint responded successfully."
                                            : backendStatus === "checking"
                                                ? "Waiting for a response from the configured health endpoint."
                                                : "The configured health endpoint did not respond."}
                                    </p>
                                </section>

                                <section className="securevoicebank-activity-card">
                                    <div className="securevoicebank-card-header">
                                        <div>
                                            <div className="card-eyebrow">SECURITY ACTIVITY</div>
                                            <h2>Recent analyses</h2>
                                        </div>
                                        <span className="online-badge">{safeHistory.length}</span>
                                    </div>
                                    {safeHistory.length === 0 ? (
                                        <div className="securevoicebank-empty-activity">
                                            <div><CheckCircle2 size={18} /></div>
                                            <p>No security activity yet.</p>
                                            <span>Completed voice and conversation analyses will appear here.</span>
                                        </div>
                                    ) : (
                                        <div className="securevoicebank-activity-list">
                                            {safeHistory.slice(0, 6).map((entry) => {
                                                const isCallShield = entry.source === "VoIP Monitor";
                                                const isAI = entry.verdict === "AI";
                                                const riskLevel = entry.callShieldRiskLevel
                                                    ? String(entry.callShieldRiskLevel).toUpperCase()
                                                    : null;

                                                return (
                                                    <div className="securevoicebank-activity-item" key={entry.id}>
                                                        <div
                                                            className={`securevoicebank-activity-icon ${isCallShield
                                                                ? riskLevel === "HIGH" || riskLevel === "CRITICAL"
                                                                    ? "threat"
                                                                    : "call"
                                                                : isAI
                                                                    ? "threat"
                                                                    : "genuine"
                                                                }`}
                                                        >
                                                            {isCallShield
                                                                ? <Phone size={16} />
                                                                : isAI
                                                                    ? <AlertTriangle size={16} />
                                                                    : <CheckCircle2 size={16} />}
                                                        </div>
                                                        <div className="securevoicebank-activity-info">
                                                            <strong>
                                                                {isCallShield
                                                                    ? `CallShield · ${riskLevel || "ANALYZED"}`
                                                                    : isAI
                                                                        ? "AI voice detected"
                                                                        : "Genuine voice detected"}
                                                            </strong>
                                                            <span>
                                                                {entry.source || "Voice analysis"} · {formatRelativeTime(entry.timestamp)}
                                                            </span>
                                                        </div>
                                                        <div className="securevoicebank-activity-result">
                                                            {isCallShield
                                                                ? `${Number(entry.callShieldRiskScore || 0)} / 100`
                                                                : isAI
                                                                    ? formatProbability(
                                                                        entry.peakAi ??
                                                                        entry.maximumAiProbability ??
                                                                        entry.aiProbability
                                                                    )
                                                                    : formatProbability(
                                                                        entry.genuineProbability ??
                                                                        entry.averageGenuine
                                                                    )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            </aside>
                        </div>
                    </div>

    );
}

export default Dashboard;
