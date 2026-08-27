import * as Accordion from '@radix-ui/react-accordion';

import type { JdTeamName } from '@/analytics/contracts';
import QuestionCard from '@/containers/select/FAQ/QuestionCard';
import { FAQInformation } from '@/types/recruiting.type';

interface TeamFAQProps {
  data: FAQInformation;
  recruitmentCycleId: string;
  teamName: JdTeamName;
}

function TeamFAQ({ data, recruitmentCycleId, teamName }: TeamFAQProps) {
  // 데이터가 없으면 해당 섹션을 렌더링하지 않음
  if (!data?.FAQList || data.FAQList.length === 0) return null;

  return (
    <section className="bg-white flex flex-col items-start gap-6 self-stretch rounded-[12px] border border-line-basicLight p-6 xs:p-5 sm:p-5">
      {/* 제목 영역 (다른 카드들과 통일) */}
      <div className="T3_Sb_20 sm:T2_Sb_18 xs:T2_Sb_18 text-text-basicPrimary">
        {data.title || 'FAQ'}
      </div>

      {/* 아코디언 영역 */}
      <Accordion.Root
        type="multiple"
        className="flex w-full flex-col items-stretch gap-3"
      >
        {data.FAQList.map((item, index) => (
          <QuestionCard
            key={item._key}
            question={item.question}
            answer={item.answer}
            faqKey={item._key}
            faqPosition={index + 1}
            pageType="jd"
            recruitmentCycleId={recruitmentCycleId}
            teamName={teamName}
          />
        ))}
      </Accordion.Root>
    </section>
  );
}

export default TeamFAQ;
