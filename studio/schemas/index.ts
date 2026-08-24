import buildTrigger from './Documents/buildTrigger';
import department from './Documents/department';
import mainPage from './Documents/mainPage';
import recruitingPage from './Documents/recruitingPage';
import recruitingSchedule from './Documents/recruitingSchedule';
import roadToPro from './Documents/roadToPro';
import { FAQItem } from './Types/FAQItem';
import applyStepContent from './Types/applyStepContent';
import article from './Types/article';
import dateContent from './Types/dateContent';
import departmentSection from './Types/departmentSection';
import informationContent from './Types/informationContent';
import { mainPageContentTypes } from './Types/mainPageContent';
import presenterContent from './Types/presenterContent';
import { recruitingPageContentTypes } from './Types/recruitingPageContent';
import recruitingScheduleContent, {
  recruitingScheduleDepartmentOverride,
} from './Types/recruitingScheduleContent';

export const schemaTypes = [
  // Document types
  department,
  mainPage,
  recruitingPage,
  roadToPro,
  recruitingSchedule,
  buildTrigger,

  // Other types
  ...mainPageContentTypes,
  ...recruitingPageContentTypes,
  applyStepContent,
  article,
  dateContent,
  departmentSection,
  FAQItem,
  informationContent,
  presenterContent,
  recruitingScheduleContent,
  recruitingScheduleDepartmentOverride,
];
