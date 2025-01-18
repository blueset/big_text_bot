import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import "react-fontpicker-ts/dist/index.css";
import GoogleFontsIcon from "~icons/simple-icons/googlefonts.jsx";
import classes from "./googleFonts.module.scss";
import fontInfo from "./fontInfo.json";
import Select, { ClassNamesConfig } from "react-select";
import comboBoxClasses from "./comboBox.module.scss";

const processedFontInfo = fontInfo.fonts.map((f) => ({
  ...f,
  label: f.name,
  value: f.name,
  score: 0,
}));
type FontInfo = (typeof processedFontInfo)[number];
const defaultFont = processedFontInfo.find((f) => f.value === "Open Sans")!;
const groupedFamilies: Record<string, string[]> = {};
fontInfo.families.forEach((item) => {
  const parts = item.split("/");
  if (parts.length === 3) {
    const category = parts[1];
    const subCategory = parts[2];

    if (!groupedFamilies[category]) {
      groupedFamilies[category] = [];
    }

    groupedFamilies[category].push(subCategory);
  }
});

const comboBoxClassesConfig: ClassNamesConfig<any, any, any> = {
  container: () => comboBoxClasses.comboBox,
  control: () => comboBoxClasses.comboBoxControl,
  menu: () => comboBoxClasses.comboBoxMenu,
  option: ({ isSelected }) =>
    isSelected
      ? comboBoxClasses.comboBoxOptionSelected
      : comboBoxClasses.comboBoxOption,
  groupHeading: () => comboBoxClasses.comboBoxGroupHeading,
};

const genericFontMapping = {
  "Sans Serif": "sans-serif",
  Display: "fancy",
  Serif: "serif",
  Handwriting: "cursive",
  Monospace: "monospace",
};

function CategorySelector({
  name,
  value,
  onChange,
  currentValue,
}: {
  name: string;
  value: string;
  currentValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      style={
        name in genericFontMapping
          ? {
              fontFamily:
                genericFontMapping[name as keyof typeof genericFontMapping],
            }
          : undefined
      }
    >
      <input
        type="radio"
        name="category"
        value={value}
        checked={value === currentValue}
        onChange={onChange}
      />
      {name}
    </label>
  );
}

export function GoogleFontsPicker({
  addFont,
}: {
  addFont: (font: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [font, setFont] = useState(defaultFont);
  const [category, setCategory] = useState("all");

  const onCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCategory(e.target.value);
    },
    []
  );

  const effectiveFontInfo = useMemo(() => {
    if (category === "all") return processedFontInfo.sort((a, b) => a.name.localeCompare(b.name));
    if (category.startsWith("/")) {
      return processedFontInfo.filter(
        (font) => {
          const score = font.families.find(
            (f) => f.family === category
          )?.score;
          if (score !== undefined) {
            font.score = parseInt(score)
            return true;
          }
          return false;
        }
      ).sort((a, b) => b.score - a.score);
    }
    return processedFontInfo.filter((font) => font.classifications.includes(category)).sort((a, b) => a.name.localeCompare(b.name));
  }, [category]);

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className={classes.secondaryButton}
      >
        <GoogleFontsIcon /> Add fonts from Google fonts
      </button>
      <dialog ref={dialogRef} className={classes.dialog}>
        <h2>Classifications</h2>
        <div className={classes.categorySelector}>
          <CategorySelector
            name="All"
            value="all"
            onChange={onCategoryChange}
            currentValue={category}
          />
          {fontInfo.classifications.map((c) => (
            <CategorySelector
              key={c}
              name={c}
              value={c}
              onChange={onCategoryChange}
              currentValue={category}
            />
          ))}
        </div>
          {Object.entries(groupedFamilies).filter(e => e[1].length > 1).map(([familyGroup, families]) => (
            <details key={familyGroup} name="families">
              <summary><h2 className={classes.inline}>{familyGroup} categories</h2></summary>
              <div className={classes.categorySelector}>
                {families.map((family) => (
                  <CategorySelector
                    key={family}
                    name={family}
                    value={`/${familyGroup}/${family}`}
                    onChange={onCategoryChange}
                    currentValue={category}
                  />
                ))}
              </div>
            </details>
          ))}
        <h2>Font</h2>
        <Select
          unstyled
          value={font}
          options={effectiveFontInfo}
          onChange={(font) => setFont(font as FontInfo)}
          classNames={comboBoxClassesConfig}
        />
        <div className={classes.buttonRow}>
          <button
            onClick={() => {
              addFont(font!.name);
              dialogRef.current?.close();
            }}
            className={classes.primaryButton}
          >
            Add
          </button>
          <button
            onClick={() => dialogRef.current?.close()}
            className={classes.secondaryButton}
          >
            Cancel
          </button>
        </div>
      </dialog>
    </>
  );
}

export function FontLoader({ fonts }: { fonts: string[] }) {
  const elementId = useId();
  useEffect(() => {
    let cssId = `google-fonts-${elementId}`;

    let link = document.getElementById(cssId) as HTMLLinkElement | null;
    if (!link && fonts.length > 0) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = cssId;
      const url = new URL(window.location.toString());
      url.pathname = "/api/font";
      fonts.forEach((f) => url.searchParams.append("family", f));
      link.href = url.toString();
      link.setAttribute("data-testid", cssId);
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    return () => {
      if (link) {
        link.remove();
      }
    };
  }, [elementId, fonts]);
  return null;
}
