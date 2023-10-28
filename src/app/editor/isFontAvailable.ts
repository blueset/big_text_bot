
export function getIsFontVariantAvailable<TParams, TPrecompute>({
    applyStyles,
    precompute,
    availablePredicate,
}: {
    applyStyles: (element: HTMLSpanElement, params: TParams) => void;
    precompute: (getWidth: (params: TParams) => number) => TPrecompute;
    availablePredicate: (params: TParams, getWidth: (params: TParams) => number, precomputed: TPrecompute) => boolean;
}) {
    let width;
    const body = document.body;

    const container = document.createElement('span');
    container.innerHTML = 'wi'.repeat(100);
    container.style.cssText = `
      position:absolute;
      width:auto;
      font-size:128px;
      left:-99999px;
    `;

    const getWidth = (params: TParams) => {
        applyStyles(container, params);

        body.appendChild(container);
        width = container.clientWidth;
        body.removeChild(container);

        return width;
    };

    const precomputed = precompute(getWidth);

    return (params: TParams) => {
        return new Promise((resolve) => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    resolve(availablePredicate(params, getWidth, precomputed));
                });
            } else {
                // Fallback to setTimeout for Safari
                setTimeout(() => {
                    resolve(availablePredicate(params, getWidth, precomputed));
                }, 0);
            }
        });
    };
}

/** 
 * Determine if a font is available.
 * @source https://github.com/system-fonts/modern-font-stacks/blob/main/site/src/_scripts.js
 * @license CC0-1.0
 */
export function getIsFontAvailable() {
    return getIsFontVariantAvailable<string, {monoWidth: number, serifWidth: number, sansWidth: number}>({
        applyStyles: (element, fontFamily) => {
            element.style.fontFamily = fontFamily;
        },
        precompute: (getWidth) => {
            const monoWidth = getWidth('monospace');
            const serifWidth = getWidth('serif');
            const sansWidth = getWidth('sans-serif');

            return { monoWidth, serifWidth, sansWidth };
        },
        availablePredicate: (fontFamily, getWidth, { monoWidth, serifWidth, sansWidth }) => {
            const available =
                monoWidth !== getWidth(`${fontFamily},monospace`) ||
                sansWidth !== getWidth(`${fontFamily},sans-serif`) ||
                serifWidth !== getWidth(`${fontFamily},serif`);
            return available;
        },
    });
}

export function getIsFontStretchAvailable() {
    return getIsFontVariantAvailable<{fontFamily: string, fontStretch: string, refFontStretch?: string}, void>({
        applyStyles: (element, {fontFamily, fontStretch}) => {
            element.style.fontFamily = fontFamily;
            element.style.fontStretch = fontStretch;
        },
        precompute: () => {},
        availablePredicate: ({fontFamily, fontStretch, refFontStretch}, getWidth) => getWidth({fontFamily, fontStretch}) !== getWidth({fontFamily, fontStretch: refFontStretch || fontStretch}),
    });
}