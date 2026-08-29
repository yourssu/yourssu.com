import { Link } from 'gatsby';
import { useEffect, useRef } from 'react';

import {
  readDepartmentAnalyticsMetadata,
  type DepartmentAnalyticsMetadata,
} from '@/analytics/cmsMetadata';
import { trackRecruitingJdCardClick } from '@/analytics/events';
import { observeRecruitingJdCardImpression } from '@/analytics/recruitingImpression';
import RecruitSectionLayout from '@/components/Layout/RecruitSectionLayout';
import RecruitTitle from '@/components/Title/RecruitTitle';
import { RecruitingPageData } from '@/types/recruitingPage';

import {
  AndroidIcon,
  BackEndIcon,
  DesigPaletteIcon,
  FrontEndIcon,
  HandsUpPeopleIcon,
  HRIcon,
  IOSIcon,
  LegalIcon,
  MarketingIcon,
  ProductManagerIcon,
} from './icons';

interface SupportingProps {
  data: RecruitingPageData['positions'];
  recruitmentCycleId: string;
}

const icons = {
  'Product Manager': ProductManagerIcon,
  'Product Designer': DesigPaletteIcon,
  Marketer: MarketingIcon,
  'iOS Engineer': IOSIcon,
  'Android Engineer': AndroidIcon,
  'HR Partner': HRIcon,
  'Frontend Engineer': FrontEndIcon,
  'Backend Engineer': BackEndIcon,
  'Legal Partner': LegalIcon,
};

type RecruitingPosition = RecruitingPageData['positions']['cards'][number];

function RecruitingPositionLink({
  card,
  cardPosition,
  metadata,
  recruitmentCycleId,
}: {
  card: RecruitingPosition;
  cardPosition: number;
  metadata: DepartmentAnalyticsMetadata;
  recruitmentCycleId: string;
}) {
  const { icon, name } = card.department.basicInformation;
  const IconComponent = icons[name as keyof typeof icons];
  const { recruitingTeamName: teamName, slug } = metadata;
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    return observeRecruitingJdCardImpression(cardRef.current, {
      cardId: card._key,
      cardPosition,
      recruitmentCycleId,
      teamName,
    });
  }, [card._key, cardPosition, recruitmentCycleId, teamName]);

  return (
    <Link
      to={`/recruiting/${slug}`}
      innerRef={cardRef}
      className="flex items-center justify-between rounded-[0.75rem] border border-line-basicLight p-6 xs:p-5 sm:p-5"
      onClick={() =>
        trackRecruitingJdCardClick({
          recruitment_cycle_id: recruitmentCycleId,
          team_name: teamName,
        })
      }
    >
      <h3 className="whitespace-pre-wrap text-2xl font-semibold text-text-basicSecondary">
        {name.replace(' ', '\n')}
      </h3>
      {IconComponent ? (
        <IconComponent />
      ) : (
        <img src={icon.asset.url} alt="" className="h-14 w-14" />
      )}
    </Link>
  );
}

function Supporting({ data, recruitmentCycleId }: SupportingProps) {
  return (
    <RecruitSectionLayout>
      <RecruitTitle
        title={data.header.title}
        subtitle={data.header.subtitle}
        SVGIconComponent={<HandsUpPeopleIcon />}
      />

      <div className="grid grid-cols-3 gap-5 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2">
        {data.cards.map((card, index) => {
          const { _key, department } = card;
          const { isRecruiting, name } = department.basicInformation;
          const metadata = readDepartmentAnalyticsMetadata(
            department._rawBasicInformation,
            `recruitingPage.positions.cards.${_key}.department.basicInformation`,
          );

          return isRecruiting ? (
            <RecruitingPositionLink
              key={_key}
              card={card}
              cardPosition={index + 1}
              metadata={metadata}
              recruitmentCycleId={recruitmentCycleId}
            />
          ) : (
            <div
              key={_key}
              className="flex cursor-not-allowed items-center justify-between rounded-[0.75rem] border border-line-basicLight p-6 xs:p-5 sm:p-5"
            >
              <h3 className="whitespace-pre-wrap text-2xl font-semibold text-text-basicDisabled">
                {name.replace(' ', '\n')}
              </h3>
            </div>
          );
        })}
      </div>
    </RecruitSectionLayout>
  );
}

export default Supporting;
