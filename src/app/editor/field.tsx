import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import classes from './field.module.scss';
import { canvasSize } from './consts';

const baseFontSize = "20px";

interface FieldConfigs {
    textColor: string;
    strokeColor: string;
    lang: string;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    fontStretch: string;
    fontFeatureSettings: string;
}

function findMinPixelSize(elm: HTMLElement): number | null {
    const values = [];
    let style = elm.getAttribute("style");
    if (style) {
        style = style.replaceAll(/rem/g, "em");
        elm.setAttribute("style", style);
        const matches = Array.from(style.matchAll(/(\d+(?:\.\d+)?)px/g));
        for (const match of matches) {
            if (parseInt(match[1])) values.push(parseInt(match[1]));
        }
        if (elm.style.fontSize && !elm.style.fontSize.endsWith("em")) {
            values.push(parseInt(window.getComputedStyle(document.body).fontSize.replace("px", "")));
            elm.style.fontSize = "";
        }
    }
    for (const child of Array.from(elm.children)) {
        const value = findMinPixelSize(child as HTMLElement);
        if (value !== null) {
            values.push(value);
        }
    }
    return values.length ? Math.min(...values) : null;
}

function convertPxToEm(elm: HTMLElement, basePx: number) {
    const style = elm.getAttribute("style");
    if (style) {
        style.replaceAll(/(\d+)px/g, (match, p1) => `${parseInt(p1) / basePx}em`);
        elm.setAttribute("style", style);
    }
    for (const child of Array.from(elm.children)) {
        convertPxToEm(child as HTMLElement, basePx);
    }
}

export function Field({ containerRef, fieldConfigs }: { containerRef?: RefObject<HTMLDivElement>, fieldConfigs: FieldConfigs }) {
    const rowRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const coverRef = useRef<HTMLDivElement>(null);

    const resize = useCallback(() => {
        const wrap = wrapRef.current;
        const text = textRef.current;
        const cover = coverRef.current;

        if (!wrap || !text || !cover) return;
        
        text.innerHTML = cover.innerHTML;
        wrap.style.fontSize = baseFontSize;

        var r1 = cover.clientWidth / cover.clientHeight;
        var r2 = canvasSize / canvasSize;
        var ratio = 1;
        if (r1 < r2){
          ratio = canvasSize / (cover.clientHeight + 10);
        } else {
          ratio = canvasSize / (cover.clientWidth + 10);
        }

        wrap.style.fontSize = `${ratio * 20}px`;
        text.style.webkitTextStrokeWidth = `${ratio * 5}px`;
    }, []);

    useLayoutEffect(resize, [resize]);

    useEffect(() => {
        const row = rowRef.current;
        const cover = coverRef.current;
        if (!row || !cover) return;

        const observer = new ResizeObserver(() => {
            row.style.scale = "1";
            row.style.scale = `${Math.min(1, row.clientWidth / 512)}`;
        });
        observer.observe(row);

        const clickListener = () => {
            coverRef.current?.focus();
        };

        const pasteListener = (e: ClipboardEvent) => {
            if (e.clipboardData?.types.includes("text/html")) {
                const html = e.clipboardData.getData("text/html");
                const div = document.createElement("div");
                div.innerHTML = html;
                const minPixelSize = findMinPixelSize(div);
                if (minPixelSize) {
                    console.log("resizer activated");
                    e.preventDefault();
                    convertPxToEm(div, minPixelSize);

                    const selection = window.getSelection();
                    if (!selection?.rangeCount) return false;
                    selection.deleteFromDocument();
                    for (const child of Array.from(div.children).reverse()) {
                        selection.getRangeAt(0).insertNode(child);
                    }
                    resize();
                }
            }
        }

        row.addEventListener("click", clickListener);
        cover.addEventListener("paste", pasteListener);

        return () => {
            observer.disconnect();
            row.removeEventListener("click", clickListener);
            cover.removeEventListener("paste", pasteListener);
        };
    }, []);

    useEffect(() => {
        const row = rowRef.current;
        if (!row) return;
        row.style.setProperty("--field-text-color", fieldConfigs.textColor);
        row.style.setProperty("--field-stroke-color", fieldConfigs.strokeColor);
        row.style.setProperty("--field-font-weight", fieldConfigs.fontWeight);
        row.style.fontFeatureSettings = fieldConfigs.fontFeatureSettings;
        row.style.fontFamily = fieldConfigs.fontFamily;
        row.style.fontWeight = fieldConfigs.fontWeight;
        row.style.fontStyle = fieldConfigs.fontStyle;
        row.style.fontStretch = fieldConfigs.fontStretch;
        row.lang = fieldConfigs.lang;
        resize();
    }, [fieldConfigs, resize])

    return (
        <div className={classes.row} ref={rowRef}>
        <div className={classes.container} ref={containerRef}>
            <div className={classes.wrap} ref={wrapRef}>
                <div data-ref="text" className={classes.text} ref={textRef}>Enter your<br />text here.</div>
                <div data-ref="cover" className={classes.textCover} contentEditable suppressContentEditableWarning ref={coverRef} onInput={resize}>Enter your<br />text here.</div>
            </div>
        </div>
        </div>
    );
}