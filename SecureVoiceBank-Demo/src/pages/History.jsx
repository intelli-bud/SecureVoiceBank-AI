import { useEffect, useState } from "react";

import {
    Trash2,
    ShieldCheck,
    ShieldAlert,
    Clock,
    ChevronDown,
    ChevronUp,
    FileAudio,
} from "lucide-react";

import {
    getHistory,
    clearHistory,
    isConfidenceVisible,
} from "../utils/history";
import ConfirmationDialog from "../components/ConfirmationDialog";


function formatDuration(seconds) {

    if (
        seconds === undefined ||
        seconds === null ||
        Number.isNaN(Number(seconds))
    ) {
        return "—";
    }

    const totalSeconds = Math.round(
        Number(seconds)
    );

    const minutes = Math.floor(
        totalSeconds / 60
    );

    const remainingSeconds =
        totalSeconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds}s`;
    }

    return `${minutes}m ${String(
        remainingSeconds
    ).padStart(2, "0")}s`;
}


function formatPercentage(value) {

    if (
        value === undefined ||
        value === null ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return `${Number(value).toFixed(2)}%`;
}


function History() {

    const [history, setHistory] = useState([]);

    const [expandedId, setExpandedId] =
        useState(null);

    const [isClearDialogOpen, setIsClearDialogOpen] =
        useState(false);


    useEffect(() => {

        setHistory(getHistory());

    }, []);


    const requestClearHistory = () => {
        setIsClearDialogOpen(true);
    };

    const confirmClearHistory = () => {
        clearHistory();
        setHistory([]);
        setExpandedId(null);
        setIsClearDialogOpen(false);

    };


    const toggleEntry = (id) => {

        setExpandedId(
            currentId =>
                currentId === id
                    ? null
                    : id
        );

    };


    return (

        <div className="history-page">

            <header className="top-header">

                <div>

                    <div className="page-eyebrow">
                        ANALYSIS RECORDS
                    </div>

                    <h1 className="page-title">
                        Detection History
                    </h1>

                    <p className="page-description">
                        Review previous voice authenticity
                        analyses performed by SecureVoiceBank.
                    </p>

                </div>


                {history.length > 0 && (

                    <button
                        type="button"
                        className="history-clear-button"
                        onClick={requestClearHistory}
                    >
                        <Trash2 size={16} />
                        CLEAR HISTORY
                    </button>

                )}

            </header>


            {history.length === 0 ? (

                <section className="panel history-empty-panel">

                    <div className="empty-threat">

                        <div className="empty-shield">
                            ◷
                        </div>

                        <h3>
                            No analysis history yet
                        </h3>

                        <p>
                            Completed voice analyses will
                            appear here automatically.
                        </p>

                    </div>

                </section>

            ) : (

                <section className="history-list">

                    {history.map((entry) => {

                        const isAI =
                            entry.verdict === "AI";

                        const date =
                            new Date(
                                entry.timestamp
                            );

                        const isExpanded =
                            expandedId === entry.id;


                        return (

                            <div
                                className={`history-item ${isExpanded
                                    ? "history-item-expanded"
                                    : ""
                                    }`}
                                key={entry.id}
                            >

                                {/* MAIN HISTORY ROW */}

                                <button
                                    className="history-row"
                                    onClick={() =>
                                        toggleEntry(
                                            entry.id
                                        )
                                    }
                                >

                                    <div
                                        className={`history-result-icon ${isAI
                                            ? "history-ai"
                                            : "history-genuine"
                                            }`}
                                    >

                                        {isAI ? (
                                            <ShieldAlert
                                                size={20}
                                            />
                                        ) : (
                                            <ShieldCheck
                                                size={20}
                                            />
                                        )}

                                    </div>


                                    <div className="history-main">

                                        <div className="history-result">

                                            <strong>
                                                {isAI
                                                    ? "AI / SPOOF VOICE"
                                                    : "GENUINE HUMAN VOICE"}
                                            </strong>

                                            <span
                                                className={`history-badge ${isAI
                                                    ? "history-badge-ai"
                                                    : "history-badge-genuine"
                                                    }`}
                                            >
                                                {entry.verdict}
                                            </span>

                                        </div>


                                        <div className="history-meta">

                                            <span>
                                                <Clock
                                                    size={13}
                                                />

                                                {date.toLocaleString()}
                                            </span>


                                            {entry.source && (

                                                <span>
                                                    SOURCE:{" "}
                                                    {entry.source}
                                                </span>

                                            )}


                                            {entry.windowsAnalyzed !==
                                                undefined && (

                                                    <span>
                                                        TOTAL WINDOWS:{" "}
                                                        {
                                                            entry.windowsAnalyzed
                                                        }
                                                    </span>

                                                )}

                                        </div>

                                    </div>


                                    {isConfidenceVisible() && (
                                        <div className="history-confidence">
                                            <div className="history-confidence-label">
                                                SESSION CONFIDENCE
                                            </div>

                                            <div className="history-confidence-value">
                                                {formatPercentage(
                                                    entry.confidence
                                                )}
                                            </div>
                                        </div>
                                    )}


                                    <div className="history-expand-icon">

                                        {isExpanded ? (
                                            <ChevronUp
                                                size={18}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={18}
                                            />
                                        )}

                                    </div>

                                </button>


                                {/* EXPANDED DETAILS */}

                                {isExpanded && (

                                    <div className="history-details">

                                        <div className="history-details-header">
                                            <span>
                                                FORENSIC ANALYSIS DETAILS
                                            </span>
                                        </div>


                                        {entry.filename && (

                                            <div className="history-file">

                                                <FileAudio
                                                    size={16}
                                                />

                                                <div>
                                                    <span>
                                                        AUDIO FILE
                                                    </span>

                                                    <strong>
                                                        {
                                                            entry.filename
                                                        }
                                                    </strong>
                                                </div>

                                            </div>

                                        )}


                                        <div className="history-detail-grid">

                                            {isConfidenceVisible() && (
                                                <div className="history-detail-card">
                                                    <span>
                                                        AI PROBABILITY
                                                    </span>

                                                    <strong className="history-ai-text">
                                                        {formatPercentage(
                                                            entry.averageAi ??
                                                            entry.aiProbability
                                                        )}
                                                    </strong>
                                                </div>
                                            )}


                                            {isConfidenceVisible() && (
                                                <div className="history-detail-card">
                                                    <span>
                                                        GENUINE PROBABILITY
                                                    </span>

                                                    <strong className="history-genuine-text">
                                                        {formatPercentage(
                                                            entry.genuineProbability ??
                                                            entry.averageGenuine
                                                        )}
                                                    </strong>
                                                </div>
                                            )}


                                            <div className="history-detail-card">

                                                <span>
                                                    DURATION
                                                </span>

                                                <strong>
                                                    {formatDuration(
                                                        entry.duration
                                                    )}
                                                </strong>

                                            </div>


                                            <div className="history-detail-card">

                                                <span>
                                                    TOTAL WINDOWS
                                                </span>

                                                <strong>
                                                    {
                                                        entry.windowsAnalyzed ??
                                                        "—"
                                                    }
                                                </strong>

                                            </div>


                                            {entry.speechWindows !== undefined && (
                                                <div className="history-detail-card">

                                                    <span>
                                                        SPEECH WINDOWS
                                                    </span>

                                                    <strong>
                                                        {entry.speechWindows}
                                                    </strong>

                                                </div>
                                            )}

                                            {entry.aiWindows !== undefined && (
                                                <div className="history-detail-card">

                                                    <span>
                                                        AI / SPOOF WINDOWS
                                                    </span>

                                                    <strong className="history-ai-text">
                                                        {entry.aiWindows}
                                                    </strong>

                                                </div>
                                            )}

                                            {entry.genuineWindows !== undefined && (
                                                <div className="history-detail-card">

                                                    <span>
                                                        GENUINE WINDOWS
                                                    </span>

                                                    <strong className="history-genuine-text">
                                                        {entry.genuineWindows}
                                                    </strong>

                                                </div>
                                            )}

                                            {entry.silenceWindows !== undefined && (
                                                <div className="history-detail-card">

                                                    <span>
                                                        SILENCE WINDOWS
                                                    </span>

                                                    <strong>
                                                        {entry.silenceWindows}
                                                    </strong>

                                                </div>
                                            )}


                                            {isConfidenceVisible() && (
                                                <div className="history-detail-card">
                                                    <span>
                                                        <span>
                                                            HIGHEST SINGLE-WINDOW AI SCORE
                                                        </span>
                                                    </span>

                                                    <strong className="history-ai-text">
                                                        {formatPercentage(
                                                            entry.peakAi ??
                                                            entry.maximumAiProbability
                                                        )}
                                                    </strong>
                                                </div>
                                            )}


                                            <div className="history-detail-card">

                                                <span>
                                                    DETECTION MODEL
                                                </span>

                                                <strong>
                                                    {
                                                        entry.model ||
                                                        "DF-Arena 1B"
                                                    }
                                                </strong>

                                            </div>

                                        </div>
                                        {/* CALLSHIELD SECURITY ANALYSIS */}

                                        {entry.callShieldRiskLevel && (
                                            <div className="history-callshield">

                                                <div className="history-callshield-header">

                                                    <div>
                                                        <div className="history-callshield-eyebrow">
                                                            CALLSHIELD SECURITY ANALYSIS
                                                        </div>

                                                        <div className="history-callshield-title">
                                                            Conversation Threat Analysis
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`history-callshield-risk ${String(
                                                            entry.callShieldRiskLevel
                                                        ).toLowerCase()
                                                            }`}
                                                    >
                                                        {entry.callShieldRiskLevel}
                                                    </div>

                                                </div>


                                                <div className="history-callshield-stats">

                                                    <div className="history-callshield-stat">

                                                        <span>
                                                            RISK SCORE
                                                        </span>

                                                        <strong>
                                                            {
                                                                entry.callShieldRiskScore ??
                                                                0
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div className="history-callshield-stat">

                                                        <span>
                                                            THREATS DETECTED
                                                        </span>

                                                        <strong>
                                                            {
                                                                Array.isArray(
                                                                    entry.callShieldReasons
                                                                )
                                                                    ? entry.callShieldReasons.length
                                                                    : 0
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>


                                                {Array.isArray(
                                                    entry.callShieldReasons
                                                ) &&
                                                    entry.callShieldReasons.length >
                                                    0 && (

                                                        <div className="history-callshield-reasons">

                                                            <div className="history-callshield-section-title">
                                                                KEY THREATS
                                                            </div>

                                                            <ul>

                                                                {entry.callShieldReasons.map(
                                                                    (
                                                                        reason,
                                                                        index
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {
                                                                                reason
                                                                            }
                                                                        </li>
                                                                    )
                                                                )}

                                                            </ul>

                                                        </div>

                                                    )}


                                                {entry.callShieldRecommendation && (
                                                    <div className="history-callshield-recommendation">

                                                        <div className="history-callshield-section-title">
                                                            RECOMMENDATION
                                                        </div>

                                                        <p>
                                                            {
                                                                entry.callShieldRecommendation
                                                            }
                                                        </p>

                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </div>

                                )}

                            </div>

                        );

                    })}

                </section>

            )}

            {isClearDialogOpen && (
                <ConfirmationDialog
                    title="Clear detection history?"
                    description="This permanently removes all saved detection results from this browser. This action cannot be undone."
                    confirmLabel="Clear history"
                    onConfirm={confirmClearHistory}
                    onCancel={() => setIsClearDialogOpen(false)}
                />
            )}

        </div>

    );
}


export default History;