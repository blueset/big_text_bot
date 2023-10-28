import { CSSProperties, useEffect, useState } from "react";
import { Option, comboBoxClassesConfig } from "./selectorTypes";
import CreatableSelect from 'react-select/creatable';
import { getIsFontStretchAvailable } from "./isFontAvailable";


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

export function FontStretchSelector({value, onChange, optionStyles}: {value: Option, onChange: (value: Option | null) => void, optionStyles: CSSProperties}) {
    const [effectiveChoices, setEffectiveChoices] = useState<Option[]>(fontStretchChoices);

    useEffect(() => {
        setTimeout(async () => {
            await document.fonts.ready;
            const isFontStretchAvailable = getIsFontStretchAvailable();
            const choices = [];
            for (let i = 0; i <(fontStretchChoices.length - 1) / 2; i++) {
                if (await isFontStretchAvailable({ fontFamily: optionStyles.fontFamily!, fontStretch: fontStretchChoices[i].value, refFontStretch: fontStretchChoices[i+1].value})) {
                    choices.push(fontStretchChoices[i]);
                }
            }
            choices.push(fontStretchChoices[(fontStretchChoices.length - 1) / 2]);
            const refPtr = choices.length;
            for (let i = (fontStretchChoices.length - 1) / 2 + 1; i < fontStretchChoices.length; i++) {
                if (await isFontStretchAvailable({ fontFamily: optionStyles.fontFamily!, fontStretch: fontStretchChoices[i].value, refFontStretch: fontStretchChoices[i-1].value})) {
                    choices.push(fontStretchChoices[i]);
                }
            }
            setEffectiveChoices(choices);
        }, 500);
    }, [optionStyles.fontFamily]);
    
    return (
        <CreatableSelect<Option>
            unstyled
            value={value}
            options={effectiveChoices}
            onChange={onChange}
            createOptionPosition="first"
            formatCreateLabel={inputValue => <span style={{...optionStyles, fontStretch: inputValue}}>Use “{inputValue}”…</span>}
            formatOptionLabel={option => <span style={{...optionStyles, fontStretch: option.value}}>{option.label}</span>}
            classNames={comboBoxClassesConfig}
        />
    );
}