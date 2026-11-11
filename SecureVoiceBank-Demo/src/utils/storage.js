const LEGACY_STORAGE_KEYS = {
    securevoicebank_auth: "vigil_auth",
    securevoicebank_account: "vigil_account",
    securevoicebank_user_email: "vigil_user_email",
    securevoicebank_user_name: "vigil_user_name",
    securevoicebank_detection_history: "vigil_detection_history",
    securevoicebank_settings: "vigil_settings",
};

export function getStorageItem(key, storage = window.localStorage) {
    const currentValue = storage.getItem(key);

    if (currentValue !== null) {
        return currentValue;
    }

    const legacyKey = LEGACY_STORAGE_KEYS[key];

    if (!legacyKey) {
        return null;
    }

    const legacyValue = storage.getItem(legacyKey);

    if (legacyValue === null) {
        return null;
    }

    try {
        storage.setItem(key, legacyValue);

        if (storage.getItem(key) === legacyValue) {
            return legacyValue;
        }

        console.warn(
            `Could not verify migration of browser storage key "${legacyKey}".`
        );
    } catch (error) {
        console.warn(
            `Could not migrate browser storage key "${legacyKey}":`,
            error
        );
    }

    return legacyValue;
}

export function setStorageItem(key, value, storage = window.localStorage) {
    storage.setItem(key, value);
}

export function removeStorageItem(key, storage = window.localStorage) {
    storage.removeItem(key);

    const legacyKey = LEGACY_STORAGE_KEYS[key];

    if (legacyKey) {
        storage.removeItem(legacyKey);
    }
}
