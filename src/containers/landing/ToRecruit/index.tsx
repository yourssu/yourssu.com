import { MainPageData } from '@/types/mainPage';

import RecruitmentBanner from './RecruitBanner';

interface ToRecruitProps {
  data: MainPageData['recruit'];
}

function ToRecruit({ data }: ToRecruitProps) {
  return (
    <section className="-mx-5 w-[calc(100%+40px)] xs:pb-10 sm:pb-10">
      <RecruitmentBanner
        imageUrl={data.image.asset.url}
        recruitTitle={{
          desktop: data.desktopTitle,
          mobile: data.mobileTitle,
        }}
        buttonText={{
          desktop: data.desktopButtonText,
          mobile: data.mobileButtonText,
        }}
        buttonLink={data.buttonLink}
      />
    </section>
  );
}

export default ToRecruit;
