import { useCallback, useMemo, useRef, useState } from "react";
import "react-fontpicker-ts/dist/index.css";
import GoogleFontsIcon from '~icons/simple-icons/googlefonts.jsx';
import classes from './googleFonts.module.scss';
import fontInfo from './fontInfo.json';
import Select, { ClassNamesConfig } from 'react-select';
import comboBoxClasses from "./comboBox.module.scss";

const processedFontInfo = fontInfo.map(f => ({...f, label: f.value}));
type FontInfo = typeof processedFontInfo[number];

const comboBoxClassesConfig: ClassNamesConfig<any, any, any> = {
    container: () => comboBoxClasses.comboBox,
    control: () => comboBoxClasses.comboBoxControl,
    menu: () => comboBoxClasses.comboBoxMenu,
    option: ({ isSelected }) => isSelected ? comboBoxClasses.comboBoxOptionSelected : comboBoxClasses.comboBoxOption,
    groupHeading: () => comboBoxClasses.comboBoxGroupHeading,
};

export function GoogleFontsLoader({ addFont }: { addFont: (font: string) => void }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [font, setFont] = useState({ category: "sans-serif", value: "Open Sans", label: "Open Sans" });
    const [category, setCategory] = useState("all");

    const onCategoryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCategory(e.target.value);
    }, []);

    const effectiveFontInfo = useMemo(() => {
        if (category === "all") return processedFontInfo;
        return processedFontInfo.filter(font => font.category === category);
    }, [category]);

    return (
        <>
            <button onClick={() => dialogRef.current?.showModal()} className={classes.secondaryButton}><GoogleFontsIcon /> Add fonts from Google fonts</button>
            <dialog ref={dialogRef} className={classes.dialog}>
                <h2>Category</h2>
                <div className={classes.categorySelector}>
                    <label className={category === "all" ? classes.checked : undefined}><input type="radio" name="category" value="all" checked={category === "all"} onChange={onCategoryChange} />All</label>
                    <label className={category === "serif" ? classes.checked : undefined} style={{ fontFamily: "serif" }}><input type="radio" name="category" value="serif" checked={category === "serif"} onChange={onCategoryChange} />Serif</label>
                    <label className={category === "sans-serif" ? classes.checked : undefined} style={{ fontFamily: "sans-serif" }}><input type="radio" name="category" value="sans-serif" checked={category === "sans-serif"} onChange={onCategoryChange} />Sans-serif</label>
                    <label className={category === "display" ? classes.checked : undefined} style={{ fontFamily: "display" }}><input type="radio" name="category" value="display" checked={category === "display"} onChange={onCategoryChange} />Display</label>
                    <label className={category === "handwriting" ? classes.checked : undefined} style={{ fontFamily: "handwriting" }}><input type="radio" name="category" value="handwriting" checked={category === "handwriting"} onChange={onCategoryChange} />Handwriting</label>
                    <label className={category === "monospace" ? classes.checked : undefined} style={{ fontFamily: "monospace" }}><input type="radio" name="category" value="monospace" checked={category === "monospace"} onChange={onCategoryChange} />Monospace</label>
                </div>
                <h2>Font</h2>
                <Select
                    unstyled
                    value={font}
                    options={effectiveFontInfo}
                    onChange={(font) => setFont(font as FontInfo)}
                    classNames={comboBoxClassesConfig}
                />
                <div className={classes.buttonRow}>
                    <button onClick={() => {
                        addFont(font.label);
                        dialogRef.current?.close();
                    }} className={classes.primaryButton}>Add</button>
                    <button onClick={() => dialogRef.current?.close()} className={classes.secondaryButton}>Cancel</button>
                </div>
            </dialog>
        </>
    )
}