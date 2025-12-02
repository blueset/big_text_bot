"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import classes from "./fallbackModal.module.scss";
import Emoji20 from "~icons/fluent/emoji-20-regular.jsx";
import Attach20 from "~icons/fluent/attach-20-regular.jsx";
import Send20 from "~icons/fluent/send-20-filled.jsx";
import Copy20 from "~icons/fluent/copy-20-regular.jsx";
import Checkmark20 from "~icons/fluent/checkmark-20-filled.jsx";

interface FallbackModalProps {
    fileId: string;
    onClose: () => void;
}

export function FallbackModal({ fileId, onClose }: FallbackModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [copied, setCopied] = useState(false);
    const queryText = `@big_text_bot &${fileId}&`;

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(queryText);
            setCopied(true);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = queryText;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
        }
    }, [queryText]);

    const handleReturnToChat = useCallback(() => {
        dialogRef.current?.close();
        onClose();
        window?.Telegram?.WebApp?.close();
    }, [onClose]);

    return (
        <dialog ref={dialogRef} className={classes.dialog}>
            <h2 className={classes.title}>Unable to send automatically</h2>
            <p className={classes.message}>
                Your Telegram app encountered an issue trying to send the sticker.
                Please copy the text below and paste it into your message box manually.
            </p>
            <div className={classes.composeBox}>
                <span className={classes.iconSecondary}><Emoji20 /></span>
                <span className={classes.queryText}>{queryText}</span>
                <span className={classes.iconSecondary}><Attach20 /></span>
                <span className={classes.iconAccent}><Send20 /></span>
            </div>
            <div className={classes.buttonRow}>
                <button
                    className={`${classes.button} ${copied ? classes.copied : ""}`}
                    onClick={handleCopy}
                >
                    {copied ? <><Checkmark20 /> Copied!</> : <><Copy20 /> Copy</>}
                </button>
                <button
                    className={classes.buttonSecondary}
                    onClick={handleReturnToChat}
                >
                    Return to chat
                </button>
            </div>
        </dialog>
    );
}
