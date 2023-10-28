"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { Field } from "./field";
import classes from "./fieldOptions.module.scss";
import CreatableSelect from 'react-select/creatable';
import Settings24 from '~icons/fluent/settings-24-regular.jsx';
import ArrowSwap20 from '~icons/fluent/arrow-swap20-regular.jsx';
import { Option, GroupedOption, comboBoxClassesConfig } from "./selectorTypes";
import { FontSelector } from "./fontSelector";
import { FontStretchSelector } from "./fontStretchSelector";

const palettes = [
    { a: "#000000", b: "#ffffff", name: "Black" },
    { a: "#c50f1f", b: "#ffffff", name: "Red" },
    { a: "#f7630c", b: "#ffffff", name: "Orange" },
    { a: "#038387", b: "#ffffff", name: "Teal" },
    { a: "#0f6cbd", b: "#ffffff", name: "Blue" },
    { a: "#107c10", b: "#ffffff", name: "Green" },
    { a: "#bf0077", b: "#ffffff", name: "Purple" },
];

const langChoices = [
    {
        label: "Latin", options: [
            { value: "en", label: "en", },
            { value: "ro", label: "ro", },
            { value: "nl", label: "nl", },
            { value: "ca", label: "ca", },
        ]
    },
    {
        label: "Cyrillic", options: [
            { value: "bg", label: "bg", },
            { value: "sr", label: "sr", },
        ]
    },
    {
        label: "CJK", options: [
            { value: "zh-hans", label: "zh-hans", },
            { value: "zh-hant", label: "zh-hant", },
            { value: "ja", label: "ja", },
            { value: "ko", label: "ko", },
        ]
    },
];


const fontStyleChoices = [
    { value: "normal", label: "normal" },
    { value: "italic", label: "italic" },
    { value: "oblique", label: "oblique" },
];

const fontStretchChoices = [
    { value: "ultra-condensed", label: "ultra-condensed" },
    { value: "extra-condensed", label: "extra-condensed" },
    { value: "condensed", label: "condensed" },
    { value: "semi-condensed", label: "semi-condensed" },
    { value: "normal", label: "normal" },
    { value: "semi-expanded", label: "semi-expanded" },
    { value: "expanded", label: "expanded" },
    { value: "extra-expanded", label: "extra-expanded" },
    { value: "ultra-expanded", label: "ultra-expanded" },
];

export function FieldWithOptions({ containerRef }: { containerRef?: RefObject<HTMLDivElement> }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [fieldConfigs, setFieldConfigs] = useState({
        textColor: "#000000",
        strokeColor: "#ffffff",
        lang: "en",
        fontFamily: "sans-serif",
        fontWeight: "700",
        fontStyle: "normal",
        fontStretch: "normal",
        fontFeatureSettings: '"palt" 1',
    });

    const [colorPalettes, setColorPalettes] = useState(palettes);

    useEffect(() => {
        const webApp = typeof window !== undefined ? window?.Telegram?.WebApp : undefined;
        const themeParams = webApp?.themeParams;
        if (themeParams?.button_color && themeParams?.button_text_color) {
            setColorPalettes(p => {
                if (p[1].name !== "Telegram theme color") {
                    return [
                        p[0],
                        { a: themeParams.button_color!, b: themeParams.button_text_color!, name: "Telegram theme color" },
                        ...p.slice(1),
                    ];
                }
                return p;
            });
        }
    }, [colorPalettes]);

    const optionStyles = {
        fontFamily: fieldConfigs.fontFamily,
        fontWeight: fieldConfigs.fontWeight,
        fontStyle: fieldConfigs.fontStyle,
        fontStretch: fieldConfigs.fontStretch,
        fontFeatureSettings: fieldConfigs.fontFeatureSettings,
    };

    return (
        <>
            <button className={classes.settingsButton} onClick={() => {
                if (!window?.Telegram?.WebApp?.isExpanded) {
                    window?.Telegram?.WebApp?.expand();
                }
                window?.Telegram?.WebApp?.MainButton.hide();
                dialogRef.current?.showModal();
            }}><Settings24 /> Options</button>
            <dialog ref={dialogRef} className={classes.settingsDialog}>
                <h2>Colors</h2>
                <div className={classes.colorRow} style={{ "--text-color": fieldConfigs.textColor, "--stroke-color": fieldConfigs.strokeColor }}>
                    {colorPalettes.map(p => (
                        <button
                            className={classes.colorButton}
                            key={p.a}
                            style={{ backgroundColor: p.a, borderColor: p.b, color: p.a }}
                            onClick={() => setFieldConfigs(fc => ({ ...fc, textColor: p.a, strokeColor: p.b, }))}
                            title={`Set color to ${p.name}`}
                        />
                    ))}
                    <button
                        className={classes.colorButton}
                        onClick={() => setFieldConfigs(fc => ({ ...fc, textColor: fc.strokeColor, strokeColor: fc.textColor }))}
                        title="Swap text and stroke colors"
                    ><ArrowSwap20 /></button>
                </div>
                <label className={classes.inputGroupRow}>Text color
                    <input value={fieldConfigs.textColor} onChange={(e) => setFieldConfigs(fc => ({ ...fc, textColor: e.target.value }))} />
                    <div className={classes.colorBox} style={{ backgroundColor: fieldConfigs.textColor, borderColor: fieldConfigs.strokeColor }} />
                </label>
                <label className={classes.inputGroupRow}>Stroke color
                    <input value={fieldConfigs.strokeColor} onChange={(e) => setFieldConfigs(fc => ({ ...fc, strokeColor: e.target.value }))} />
                    <div className={classes.colorBox} style={{ backgroundColor: fieldConfigs.strokeColor, borderColor: fieldConfigs.textColor }} />
                </label>
                <h2>Regional variants</h2>
                <CreatableSelect<Option, false, GroupedOption>
                    unstyled
                    value={{ value: fieldConfigs.lang, label: fieldConfigs.lang }}
                    options={langChoices}
                    onChange={(lang) => setFieldConfigs(fc => ({ ...fc, lang: lang!.value }))}
                    createOptionPosition="first"
                    formatCreateLabel={inputValue => `Use “${inputValue}”`}
                    classNames={comboBoxClassesConfig}
                />
                <h2>Fonts</h2>
                <label className={classes.inputGroupColumn}>Font family
                    <FontSelector value={{ value: fieldConfigs.fontFamily, label: fieldConfigs.fontFamily }} onChange={(fontFamily) => setFieldConfigs(fc => ({ ...fc, fontFamily: fontFamily!.value }))} optionStyles={optionStyles} />
                </label>
                <label className={classes.inputGroupRow}>Font weight
                    <input value={fieldConfigs.fontWeight} onChange={(e) => setFieldConfigs(fc => ({ ...fc, fontWeight: e.target.value }))} placeholder="A value between 100 and 900, e.g. 700" style={optionStyles} />
                </label>
                <label className={classes.inputGroupRow}>Font style
                    <CreatableSelect<Option>
                        unstyled
                        value={{ value: fieldConfigs.fontStyle, label: fieldConfigs.fontStyle }}
                        options={fontStyleChoices}
                        onChange={(fontStyle) => setFieldConfigs(fc => ({ ...fc, fontStyle: fontStyle!.value }))}
                        createOptionPosition="first"
                        formatCreateLabel={inputValue => <span style={{...optionStyles, fontStyle: inputValue}}>Use “{inputValue}”…</span>}
                        formatOptionLabel={option => <span style={{...optionStyles, fontStyle: option.value}}>{option.label}</span>}
                        classNames={comboBoxClassesConfig}
                    />
                </label>
                <label className={classes.inputGroupRow}>Font stretch
                    {/* <CreatableSelect<Option>
                        unstyled
                        value={{ value: fieldConfigs.fontStretch, label: fieldConfigs.fontStretch }}
                        options={fontStretchChoices}
                        onChange={(fontStretch) => setFieldConfigs(fc => ({ ...fc, fontStretch: fontStretch!.value }))}
                        createOptionPosition="first"
                        formatCreateLabel={inputValue => <span style={{...optionStyles, fontStretch: inputValue}}>Use “{inputValue}”…</span>}
                        formatOptionLabel={option => <span style={{...optionStyles, fontStretch: option.value}}>{option.label}</span>}
                        classNames={comboBoxClassesConfig}
                    /> */}
                    <FontStretchSelector value={{ value: fieldConfigs.fontStretch, label: fieldConfigs.fontStretch }} onChange={(fontStretch) => setFieldConfigs(fc => ({ ...fc, fontStretch: fontStretch!.value }))} optionStyles={optionStyles} />
                </label>
                <label className={classes.inputGroupColumn}>Advanced OpenType feature settings
                    <input value={fieldConfigs.fontFeatureSettings} onChange={(e) => setFieldConfigs(fc => ({ ...fc, fontFeatureSettings: e.target.value }))} placeholder='e.g. "palt" 1' />
                </label>
                <form method="dialog">
                    <button className={classes.button} onClick={() => window?.Telegram?.WebApp?.MainButton?.show?.()}>Close</button>
                </form>
            </dialog>
            <Field containerRef={containerRef} fieldConfigs={fieldConfigs} />
        </>
    );
}