import { ClassNamesConfig } from "react-select";
import comboBoxClasses from "./comboBox.module.scss";

export interface Option { value: string; label?: string };
export interface GroupedOption { label: string; options: Option[] };

export const comboBoxClassesConfig: ClassNamesConfig<any, any, any> = {
    container: () => comboBoxClasses.comboBox,
    control: () => comboBoxClasses.comboBoxControl,
    menu: () => comboBoxClasses.comboBoxMenu,
    option: ({ isSelected }) => isSelected ? comboBoxClasses.comboBoxOptionSelected : comboBoxClasses.comboBoxOption,
    groupHeading: () => comboBoxClasses.comboBoxGroupHeading,
};
