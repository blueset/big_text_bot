"use client";

import { useEffect, useRef } from "react";
import { Field } from "./field";
import { generateSticker } from "./generate";
import { FieldWithOptions } from "./fieldOptions";

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

    return <>
        <FieldWithOptions containerRef={containerRef} />
    </>;
}