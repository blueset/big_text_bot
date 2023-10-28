import { useState, useMemo, useEffect, CSSProperties } from "react";
import { FontLoader, GoogleFontsPicker } from "./googleFonts";
import { getIsFontAvailable } from "./isFontAvailable";
import { Option, GroupedOption, comboBoxClassesConfig } from "./selectorTypes";
import CreatableSelect from 'react-select/creatable';
import FontPicker from "react-fontpicker-ts";

const baseFontChoices: GroupedOption[] = [
    {
        label: "Basic", options: [
            { value: "sans-serif", label: "sans-serif" },
            { value: "serif", label: "serif" },
            { value: "monospace", label: "monospace" },
            { value: "cursive", label: "cursive" },
            { value: "fantasy", label: "fantasy" },
            { value: "ui-sans-serif", label: "ui-sans-serif" },
            { value: "ui-serif", label: "ui-serif" },
            { value: "ui-monospace", label: "ui-monospace" },
            { value: "ui-rounded", label: "ui-rounded" },
        ]
    },
];

/**
 * @source https://github.com/system-fonts/modern-font-stacks
 * @license CC0-1.0
 */
const ModernFontStacksChoices = [
    {
        name: "Transitional",
        values: ["Charter", 'Bitstream Charter', 'Sitka Text', "Cambria"],
    },
    {
        name: "Old Style",
        values: ['Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', "P052"],
    },
    {
        name: "Humanist",
        values: ['Seravek', 'Gill Sans Nova', 'Ubuntu', 'Calibri', 'DejaVu Sans', 'source-sans-pro'],
    },
    {
        name: "Geometric Humanist",
        values: ['Avenir', 'Montserrat', 'Corbel', 'URW Gothic'],
    },
    {
        name: "Classical Humanist",
        values: ['Optima', 'Candara', 'Noto Sans'],
    },
    {
        name: "Neo-Grotesque",
        values: ['Inter', 'Roboto', 'Helvetica Neue', 'Arial Nova', 'Nimbus Sans', 'Arial'],
    },
    {
        name: "Monospace Slab Serif",
        values: ['Nimbus Mono PS', 'Courier New'],
    },
    {
        name: "Monospace Code",
        values: ['Cascadia Code', 'Source Code Pro', 'Menlo', 'Consolas', 'DejaVu Sans Mono'],
    },
    {
        name: "Industrial",
        values: ['Bahnschrift', 'DIN Alternate', 'Franklin Gothic Medium', 'Nimbus Sans Narrow', 'sans-serif-condensed'],
    },
    {
        name: "Rounded",
        values: ['ui-rounded', 'Hiragino Maru Gothic ProN', 'Quicksand', 'Comfortaa', 'Manjari', 'Arial Rounded MT', 'Arial Rounded MT Bold', 'Calibri'],
    },
    {
        name: "Slab Serif",
        values: ['Rockwell', 'Rockwell Nova', 'Roboto Slab', 'DejaVu Serif', 'Sitka Small']
    },
    {
        name: "Antique",
        values: ['Superclarendon', 'Bookman Old Style', 'URW Bookman', 'URW Bookman L', 'Georgia Pro', 'Georgia']
    },
    {
        name: "Didone",
        values: ['Didot', 'Bodoni MT', 'Noto Serif Display', 'URW Palladio L', 'Sylfaen']
    },
    {
        name: "Handwritten",
        values: ['Segoe Print', 'Bradley Hand', 'Chilanka', 'TSCu_Comic', 'casual'],
    },
];

export function FontSelector({value, onChange, optionStyles}: {value: Option, onChange: (value: Option | null) => void, optionStyles: CSSProperties}) {
    const [googleFontsLoaded, setGoogleFontsLoaded] = useState<string[]>([]);
    const [fontChoices, setFontChoices] = useState<GroupedOption[]>(baseFontChoices);
    const effectiveFontChoices = useMemo(() => {
        if (!googleFontsLoaded) return fontChoices;
        return [
            ...fontChoices,
            { label: "Google Fonts", options: googleFontsLoaded.map(f => ({ value: f, label: f })) },
        ];
    }, [fontChoices, googleFontsLoaded]);

    useEffect(() => {
        (async () => {
            const choices = [...baseFontChoices];
            const isFontAvailable = getIsFontAvailable();
            choices[0].options = (await Promise.all(choices[0].options.map(f => isFontAvailable(f.value).then(a => a ? f : null)))).filter((a): a is Option => a !== null);
            const modernFontStackChoices: GroupedOption = { label: "Latin Modern Font Stacks", options: [] };
            modernFontStackChoices.options = (await Promise.all(ModernFontStacksChoices.map(async ({ name, values }) => {
                const firstAvailableValue = (await Promise.all(values.map(f => isFontAvailable(f).then(a => a ? f : null)))).find((a): a is string => a !== null);
                return firstAvailableValue ? { value: firstAvailableValue, label: `${name} (${firstAvailableValue})` } as Option : null;
            }))).filter((a): a is Option => a !== null);
            choices.push(modernFontStackChoices);
            setFontChoices(choices);
        })();
    }, []);
    
    return (
        <>
            <CreatableSelect<Option, false, GroupedOption>
                unstyled
                value={value}
                options={effectiveFontChoices}
                onChange={onChange}
                createOptionPosition="first"
                formatCreateLabel={inputValue => <span style={{...optionStyles, fontFamily: inputValue}}>Use “{inputValue}”…</span>}
                classNames={comboBoxClassesConfig}
                formatOptionLabel={option => <span style={{...optionStyles, fontFamily: option.value}}>{option.label}</span>}
                // menuIsOpen
            />
            <GoogleFontsPicker addFont={(font) => { setGoogleFontsLoaded(f => [...f, font]); onChange({ value: font, label: font }); }} />
            {/* <FontPicker loadAllVariants loaderOnly loadFonts={googleFontsLoaded} /> */}
            <FontLoader fonts={googleFontsLoaded} />
        </>
    );

}