"use client";

import { useEffect, useRef } from "react";
import { generateSticker } from "./generate";
import { FieldWithOptions } from "./fieldOptions";
import { ErrorBoundary } from "./errorBoundary";

export default function Page() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isUploadingRef = useRef<boolean>(false);

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
        </ErrorBoundary>
    );
}