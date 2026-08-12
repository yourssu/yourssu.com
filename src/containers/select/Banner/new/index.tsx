import { RecruitingPageData } from '@/types/recruitingPage';

interface RecruitBannerProps {
  data: RecruitingPageData['banner'];
}

function RecruitBanner({ data }: RecruitBannerProps) {
  return (
    <section className="w-screen">
      <div
        className="flex h-[102px] w-full flex-col items-center justify-center gap-1 self-stretch bg-cover bg-center bg-no-repeat px-5"
        style={{ backgroundImage: `url(${data.image.asset.url})` }}
      >
        <span className="T3_Sb_20 sm:T1_Sb_20 xs:T1_Sb_20 text-center text-text-basicWhite">
          {data.title}
        </span>
        <span className="B3_Rg_14 sm:B3_Rg_14 xs:B3_Rg_14 text-center text-text-basicWhite">
          {data.description}
        </span>
      </div>
    </section>
  );
}

export default RecruitBanner;
