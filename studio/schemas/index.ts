import buildTrigger from './Documents/buildTrigger'
import department from './Documents/department'
import recruitingSchedule from './Documents/recruitingSchedule'
import roadToPro from './Documents/roadToPro'
import applyStepContent from './Types/applyStepContent'
import dateContent from './Types/dateContent'
import defaultContent from './Types/defaultContent'
import inaWordContent from './Types/inaWordContent'
import informationContent from './Types/informationContent'
import presenterContent from './Types/presenterContent'
import recruitingScheduleContent from './Types/recruitingScheduleContent'
import roadToProContent from './Types/roadToProContent'
import skillContent from './Types/skillContent'
import articleContent from './Types/articleContent'
import article from './Types/article'
import FAQContent from './Types/FAQContent'

export const schemaTypes = [
  // Document types
  department,
  roadToPro,
  recruitingSchedule,
  buildTrigger,

  // Other types
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
  FAQContent,
]
