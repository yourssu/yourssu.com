import { Link } from 'gatsby';

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

function Supporting({ data }: SupportingProps) {
  return (
    <RecruitSectionLayout>
      <RecruitTitle
        title={data.header.title}
        subtitle={data.header.subtitle}
        SVGIconComponent={<HandsUpPeopleIcon />}
      />

      <div className="grid grid-cols-3 gap-5 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2">
        {data.cards.map(({ _key, department, isRecruiting }) => {
          const name = department.basicInformation.name;
          const IconComponent = icons[name as keyof typeof icons];

          return isRecruiting ? (
            <Link
              to={name.toLowerCase().replaceAll(' ', '_')}
              key={_key}
              className="flex items-center justify-between rounded-[0.75rem] border border-line-basicLight p-6 xs:p-5 sm:p-5"
            >
              <h3 className="whitespace-pre-wrap text-2xl font-semibold text-text-basicSecondary">
                {name.replace(' ', '\n')}
              </h3>
              {IconComponent ? (
                <IconComponent />
              ) : (
                <img
                  src={department.basicInformation.icon.asset.url}
                  alt=""
                  className="h-14 w-14"
                />
              )}
            </Link>
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
