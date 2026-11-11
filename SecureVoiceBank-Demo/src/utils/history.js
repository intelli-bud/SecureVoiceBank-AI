import {
    getStorageItem,
    removeStorageItem,
    setStorageItem,
} from "./storage";

const HISTORY_KEY = "securevoicebank_detection_history";

export function getHistory() {
    try {
        const stored = getStorageItem(HISTORY_KEY);

        if (!stored) {
            return [];
        }

        return JSON.parse(stored);
    } catch (error) {
        console.error("Could not load SecureVoiceBank history:", error);
        return [];
    }
}


export function saveHistory(entry) {
    try {
        const history = getHistory();

        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...entry,
        };

        const updatedHistory = [
            newEntry,
            ...history,
        ];

        setStorageItem(HISTORY_KEY, JSON.stringify(updatedHistory));

        window.dispatchEvent(new Event("securevoicebank-history-updated"));

        return newEntry;

    } catch (error) {
        console.error("Could not save SecureVoiceBank history:", error);
        return null;
    }
}


export function clearHistory() {
    removeStorageItem(HISTORY_KEY);

    window.dispatchEvent(
        new Event("securevoicebank-history-updated")
    );
}


const SETTINGS_KEY = "securevoicebank_settings";

export function isHistoryAutoSaveEnabled() {
    try {
        const stored =
            getStorageItem(SETTINGS_KEY);

        if (!stored) {
            return true;
        }

        const settings = JSON.parse(stored);

        return settings.autoSaveHistory !== false;

    } catch (error) {
        console.error(
            "Could not load SecureVoiceBank settings:",
            error
        );

        return true;
    }
}

export function isConfidenceVisible() {
    try {
        const stored =
            getStorageItem(SETTINGS_KEY);

        if (!stored) {
            return true;
        }

        const settings = JSON.parse(stored);

        return settings.showConfidence !== false;
    } catch (error) {
        console.error(
            "Could not load SecureVoiceBank settings:",
            error
        );

        return true;
    }
}