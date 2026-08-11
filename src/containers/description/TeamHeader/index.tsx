import { navigate } from 'gatsby';

import { BasicInformation } from '@/types/recruiting.type';

import { ArrowForwardIcon } from './ArrowForwardIcon';

function TeamHeader({
  name,
  basicInformation,
}: {
  name: string;
  basicInformation: BasicInformation;
}) {
  const introLines = basicInformation.short_introduction.split('\\n');

  return (
    <section className="flex flex-col items-center justify-center gap-8 self-stretch bg-bg-basicDefault px-[120px] pb-5 pt-40 xs:px-0 xs:pb-5 xs:pt-20 sm:px-0 sm:pb-5 sm:pt-20">
      <div className="flex flex-col items-start gap-8 self-stretch">
        <button
          type="button"
          aria-label="채용 포지션 목록으로 돌아가기"
          className="flex h-11 w-11 items-center justify-center gap-[0.63rem] rounded-[1.875rem] border border-line-basicLight bg-bg-basicLight"
          onClick={() => navigate('/recruiting')}
        >
          <ArrowForwardIcon />
        </button>
        <div className="flex flex-col items-start gap-3 self-stretch xs:gap-2 sm:gap-2">
          <div className="T2_Rg_24 sm:T1_Rg_20 xs:T1_Rg_20 self-stretch whitespace-pre-line text-text-basicSecondary">
            {introLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <p className="H2_Sb_40 sm:H2_Sb_28 xs:H2_Sb_28 self-stretch text-text-basicPrimary">
            {name}
          </p>
        </div>
      </div>
    </section>
  );
}

export default TeamHeader;
