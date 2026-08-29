import { navigate } from 'gatsby';

import { trackMainRecruitingCtaClick } from '@/analytics/events';
import { BoxButton } from '@/components/Button/BoxButton';

interface RecruitmentBannerProps {
  imageUrl: string;
  recruitTitle: {
    desktop: string;
    mobile: string;
  };
  buttonText: {
    desktop: string;
    mobile: string;
  };
  buttonLink: string;
}

function RecruitmentBanner({
  imageUrl,
  recruitTitle,
  buttonText,
  buttonLink,
}: RecruitmentBannerProps) {
  return (
    <div
      className="relative flex h-[430px] w-full flex-col items-center justify-items-end gap-9 bg-cover bg-center py-[133px] xs:h-[210px] xs:gap-[14px] xs:py-[50px] sm:h-[210px] sm:gap-[14px] sm:py-[50px]"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div
        className="absolute inset-0 bg-black-0 bg-opacity-50"
        aria-hidden="true"
      />

      {/* 타이틀 영역 */}
      <h2 className="H3_Sb_32 sm:T1_Sb_20 xs:T1_Sb_20 relative text-center text-white-0">
        {/* 데스크탑 */}
        <span className="block whitespace-pre-wrap xs:hidden sm:hidden">
          {recruitTitle.desktop}
        </span>
        {/* 모바일 */}
        <span className="hidden whitespace-pre-wrap xs:block sm:block">
          {recruitTitle.mobile}
        </span>
      </h2>

      {/* 버튼 영역 */}
      <div className="relative">
        <BoxButton
          onClick={() => {
            trackMainRecruitingCtaClick({
              cta_label: 'apply',
              cta_location: 'bottom_cta',
            });
            navigate(buttonLink);
          }}
        >
          <span className="block xs:hidden sm:hidden">
            {buttonText.desktop}
          </span>
          <span className="hidden xs:block sm:block">{buttonText.mobile}</span>
        </BoxButton>
      </div>
    </div>
  );
}

export default RecruitmentBanner;
