import { PracticeLevel, PracticeTheme, PracticeDuration } from './types';
// FIX: To avoid using JSX in a .ts file, the icon type is changed from ReactNode to FC to store the component constructor.
import type { FC } from 'react';
import { LifeIcon, BusinessIcon, TravelIcon, CultureIcon, AcademicIcon } from './components/icons/ThemeIcons';


export const LEVEL_OPTIONS = Object.values(PracticeLevel);
export const DURATION_OPTIONS = Object.values(PracticeDuration);

// FIX: The `icon` property now holds a reference to the functional component (FC) instead of a rendered ReactNode.
export const THEME_OPTIONS: { value: PracticeTheme, label: string, icon: FC }[] = [
    // FIX: Icons are now references to the component functions, not invoked JSX elements.
    { value: PracticeTheme.Life, label: "生活", icon: LifeIcon },
    { value: PracticeTheme.Business, label: "商業", icon: BusinessIcon },
    { value: PracticeTheme.Travel, label: "旅遊", icon: TravelIcon },
    { value: PracticeTheme.Culture, label: "文化與社會", icon: CultureIcon },
    { value: PracticeTheme.Academic, label: "學術", icon: AcademicIcon },
];
