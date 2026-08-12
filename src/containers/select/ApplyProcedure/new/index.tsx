import RecruitSectionLayout from '@/components/Layout/RecruitSectionLayout';
import RecruitTitle from '@/components/Title/RecruitTitle';
import { RecruitingPageData } from '@/types/recruitingPage';

import ApplyStepItem from './ApplyStepItem';
import {
  ApplyOneIcon,
  ApplyThreeIcon,
  ApplyTwoIcon,
  BraceIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  DocumentIcon,
  HandshakeIcon,
  ScheduleIcon,
} from './icons';

interface ApplyProcessProps {
  data: RecruitingPageData['journey'];
}

const cardIcons = [ApplyOneIcon, ApplyTwoIcon, ApplyThreeIcon];
const taskIcons = [
  [DocumentIcon, BriefcaseIcon],
  [HandshakeIcon, BraceIcon],
  [CheckCircleIcon],
];

function ApplyProcess({ data }: ApplyProcessProps) {
  return (
    <RecruitSectionLayout>
      <RecruitTitle
        title={data.header.title}
        subtitle={data.header.subtitle}
        SVGIconComponent={<ScheduleIcon />}
      />

      <div className="flex w-full gap-5 self-stretch xs:flex-col sm:flex-col md:flex-col">
        {data.steps.map((step, stepIndex) => {
          const CardIcon = cardIcons[stepIndex] ?? ApplyThreeIcon;
          return (
            <ApplyStepItem
              key={step._key}
              data={step}
              cardIcon={<CardIcon />}
              chips={step.tasks.map((title, taskIndex) => {
                const TaskIcon =
                  taskIcons[stepIndex]?.[taskIndex] ?? CheckCircleIcon;
                return { icon: <TaskIcon />, title };
              })}
            />
          );
        })}
      </div>

      <p className="sm:B4_Rg_13 xs:B4_Rg_13 B3_Rg_14 text-text-basicTertiary">
        {data.notice}
      </p>
    </RecruitSectionLayout>
  );
}

export default ApplyProcess;
