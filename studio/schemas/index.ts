import buildTrigger from './Documents/buildTrigger';
import department from './Documents/department';
import mainPage from './Documents/mainPage';
import recruitingSchedule from './Documents/recruitingSchedule';
import roadToPro from './Documents/roadToPro';
import applyStepContent from './Types/applyStepContent';
import dateContent from './Types/dateContent';
import defaultContent from './Types/defaultContent';
import inaWordContent from './Types/inaWordContent';
import informationContent from './Types/informationContent';
import { mainPageContentTypes } from './Types/mainPageContent';
import presenterContent from './Types/presenterContent';
import recruitingScheduleContent from './Types/recruitingScheduleContent';
import roadToProContent from './Types/roadToProContent';
import skillContent from './Types/skillContent';
import articleContent from './Types/articleContent';
import article from './Types/article';
import FAQContent, { FAQItem } from './Types/FAQContent';

export const schemaTypes = [
  // Document types
  department,
  mainPage,
  roadToPro,
  recruitingSchedule,
  buildTrigger,

  // Other types
  ...mainPageContentTypes,
  defaultContent,
  skillContent,
  informationContent,
  applyStepContent,
  roadToProContent,
  inaWordContent,
  presenterContent,
  recruitingScheduleContent,
  dateContent,
  articleContent,
  article,
  FAQItem,
  FAQContent,
];
