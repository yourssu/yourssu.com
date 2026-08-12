import InfoCard from '@/components/Card/InfoCard';
import RecruitSectionLayout from '@/components/Layout/RecruitSectionLayout';
import RecruitTitle from '@/components/Title/RecruitTitle';
import { RecruitingPageData } from '@/types/recruitingPage';

import {
  HandIcon,
  IdealHeartIcon,
  IdealProfileIcon,
  TrophyIcon,
} from './icons';

interface IdealProps {
  data: RecruitingPageData['ideal'];
}

const cardIcons = [HandIcon, IdealHeartIcon, TrophyIcon];

function Ideal({ data }: IdealProps) {
  return (
    <RecruitSectionLayout>
      <RecruitTitle
        title={data.header.title}
        subtitle={data.header.subtitle}
        SVGIconComponent={<IdealProfileIcon />}
      />

      <div className="flex gap-5 self-stretch xs:flex-col sm:flex-col md:flex-col">
        {data.cards.map((card, index) => {
          const CardIcon = cardIcons[index] ?? TrophyIcon;
          return (
            <InfoCard
              key={card._key}
              idealData={card}
              SVGIconComponent={<CardIcon />}
            />
          );
        })}
      </div>
    </RecruitSectionLayout>
  );
}

export default Ideal;
