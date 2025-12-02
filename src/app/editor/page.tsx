"use client";

import { useEffect, useRef, useState } from "react";
import { generateSticker } from "./generate";
import { FieldWithOptions } from "./fieldOptions";
import { ErrorBoundary } from "./errorBoundary";
import { FallbackModal } from "./fallbackModal";

export default function Page() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isUploadingRef = useRef<boolean>(false);
    const [showFallbackModal, setShowFallbackModal] = useState(false);
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);

    useEffect(() => {
        const webapp = window?.Telegram?.WebApp;
        if (!webapp) { alert("Web App not found!"); return; };
        webapp.MainButton.text = "Send";
        webapp.onEvent("mainButtonClicked", async () => {
            try {
                if (!isUploadingRef.current) {
                    isUploadingRef.current = true;
                    webapp.MainButton.showProgress();
                    const fileId = await generateSticker(containerRef);
                    webapp.switchInlineQuery(`&${fileId}&`);
                    
                    // Show fallback modal after 3 seconds in case switchInlineQuery doesn't work
                    setCurrentFileId(fileId);
                    setTimeout(() => {
                        setShowFallbackModal(true);
                        webapp.MainButton.hideProgress();
                    }, 3000);
                    
                    isUploadingRef.current = false;
                }
            } catch (e) {
                console.error(e);
                webapp.showPopup({
                    title: "Error",
                    text: `${e}`,
                });
                webapp.MainButton.hideProgress();
            }
        });
        webapp.MainButton.show();
        webapp.ready();
    }, []);

    return (
        <ErrorBoundary>
        {process.env.NODE_ENV === "development" && (
            <button onClick={async () => {
                if (!containerRef.current) return;
                await generateSticker(containerRef);
            }}>
                Generate Sticker
            </button>
        )}
            <FieldWithOptions containerRef={containerRef} />
            {showFallbackModal && currentFileId && (
                <FallbackModal 
                    fileId={currentFileId} 
                    onClose={() => setShowFallbackModal(false)} 
                />
            )}
        </ErrorBoundary>
    );
}