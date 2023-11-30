import { RefObject, useRef, useState } from 'react';
import classes from './htmlEdit.module.scss';
import Code24 from '~icons/fluent/code-24-filled.jsx';
import CodeEditor from '@uiw/react-textarea-code-editor';

export function HTMLEdit({ containerRef }: { containerRef?: RefObject<HTMLDivElement> }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [html, setHtml] = useState("");
    return (
        <>
            <button onClick={() => {
                setHtml(containerRef?.current?.querySelector("[data-ref=cover]")?.innerHTML ?? "");
                dialogRef.current?.showModal();
            }} className={classes.secondaryButton}><Code24 /> Edit HTML (Advanced)</button>
            <dialog ref={dialogRef} className={classes.dialog}>
                <h2>Edit text HTML</h2>
                <CodeEditor className={classes.textarea} data-color-mode="dark" language="html" value={html} onChange={e => setHtml(e.target.value)} />
                <div className={classes.buttonRow}>
                    <button onClick={() => setHtml(containerRef?.current?.querySelector("[data-ref=cover]")?.innerHTML ?? "")} className={classes.secondaryButton}>Revert</button>
                    <button onClick={() => {
                        dialogRef.current?.close();
                        const cover = containerRef?.current?.querySelector("[data-ref=cover]");
                        const text = containerRef?.current?.querySelector("[data-ref=text]");
                        if (cover) {
                            cover.innerHTML = html;
                            cover.dispatchEvent(new Event("input", {
                                bubbles: true,
                                cancelable: true,
                            }));
                        }
                        if (text) text.innerHTML = html;
                    }} className={classes.primaryButton}>Save</button>
                </div>
            </dialog>
        </>
    )
}