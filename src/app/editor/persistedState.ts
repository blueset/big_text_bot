import { useEffect, useState } from 'react';

export const knownPersistedKeys = ["fieldConfigs", "googleFonts"] as const;
export type KnownPersistedKey = typeof knownPersistedKeys[number];

export async function clearPersistedKeys() {
    for (const key of knownPersistedKeys) {
        if (window?.Telegram?.WebApp?.CloudStorage?.removeItem) {
            const tRemoveItem = window.Telegram.WebApp.CloudStorage.removeItem;
            await new Promise<void>((resolve) => {
                tRemoveItem(key, () => resolve());
            });
        }
        if (window?.localStorage) {
            window.localStorage.removeItem(key);
        }
    }
}

export async function getValue(key: KnownPersistedKey): Promise<string | undefined> {
    if (window?.Telegram?.WebApp?.CloudStorage?.getItem) {
        const tGetItem = window.Telegram.WebApp.CloudStorage.getItem;
        return new Promise<string | undefined>((resolve, reject) => {
            tGetItem(key, (error: any, value: string) => {
                if (value) {
                    resolve(value);
                } else {
                    resolve(undefined);
                }
            });
        });
    }
    if (window?.localStorage) {
        const value = window.localStorage.getItem(key);
        return value || undefined;
    }
    throw new Error('No storage available');
}

export async function setValue(key: string, value: string) {
    if (window?.Telegram?.WebApp?.CloudStorage?.setItem) {
        const tSetItem = window.Telegram.WebApp.CloudStorage.setItem;
        return new Promise<void>((resolve, reject) => {
            tSetItem(key, value, (error: any, stored: boolean) => {
                if (stored) {
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    }
    if (window?.localStorage) {
        window.localStorage.setItem(key, value);
        return;
    }
    throw new Error('No storage available');
}

export function usePersistedState<T>(key: KnownPersistedKey, initialState: T | (() => T), dontSaveOnSet?: boolean): [T, (value: T | ((oldValue: T) => T)) => void] {
    // Initialize state with default value
    const [state, setState] = useState<T>(initialState);

    // Load persisted value on mount
    useEffect(() => {
        getValue(key)
            .then(value => {
                if (!value) {
                    return;
                }
                try {
                    const parsed = JSON.parse(value) as T;
                    setState(parsed);
                } catch (e) {
                    console.error('Failed to parse persisted state:', e);
                }
            })
            .catch(error => {
                console.error('Failed to load persisted state:', error);
            });
    }, [key]);

    // Create setState wrapper that persists the new value
    const setPersistedState = (value: T | ((oldValue: T) => T)) => {
        setState(currentState => {
            const newState = typeof value === 'function' ? (value as (oldValue: T) => T)(currentState) : value;
            
            if (!dontSaveOnSet) {
                setValue(key, JSON.stringify(newState))
                    .catch(error => {
                        console.error('Failed to persist state:', error);
                    });
            }

            if (key === "fieldConfigs") {
                setValue("googleFonts", JSON.stringify((newState as any)["isGoogleFont"] ? [(newState as any)["fontFamily"]] : []));
            }
            
            return newState;
        });
    };

    return [state, setPersistedState];
}
