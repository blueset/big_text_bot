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
        if (!row) return;

        const observer = new ResizeObserver(() => {
            row.style.scale = "1";
            row.style.scale = `${Math.min(1, row.clientWidth / 512)}`;
        });
        observer.observe(row);

        const clickListener = () => {
            coverRef.current?.focus();
        };
        row.addEventListener("click", clickListener);

        return () => {
            observer.disconnect();
            row.removeEventListener("click", clickListener);
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
                <div className={classes.text} ref={textRef}>Enter your<br />text here.</div>
                <div className={classes.textCover} contentEditable suppressContentEditableWarning ref={coverRef} onInput={resize}>Enter your<br />text here.</div>
            </div>
        </div>
        </div>
    );
}