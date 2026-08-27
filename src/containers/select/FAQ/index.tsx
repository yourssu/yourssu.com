import * as Accordion from '@radix-ui/react-accordion';

import { trackRecruitingContactClick } from '@/analytics/events';
import RecruitSectionLayout from '@/components/Layout/RecruitSectionLayout';
import RecruitTitle from '@/components/Title/RecruitTitle';
import { RecruitingPageData } from '@/types/recruitingPage';

import QuestionCard from './QuestionCard';
import { QuestionIcon } from './icons';

interface FAQProps {
  data: RecruitingPageData['faq'];
  recruitmentCycleId: string;
}

function FAQ({ data, recruitmentCycleId }: FAQProps) {
  return (
    <RecruitSectionLayout id="faq">
      <RecruitTitle
        title={data.header.title}
        subtitle={data.header.subtitle}
        SVGIconComponent={<QuestionIcon />}
      />
      <Accordion.Root
        type="multiple"
        className="flex w-full flex-col items-stretch gap-5"
      >
        {data.items.map((item, index) => (
          <QuestionCard
            key={item._key}
            {...item}
            faqKey={item._key}
            faqPosition={index + 1}
            pageType="recruiting"
            recruitmentCycleId={recruitmentCycleId}
            onAnswerLinkClick={
              index === data.items.length - 1 && item.link
                ? () =>
                    trackRecruitingContactClick({
                      cta_location: 'faq_answer',
                      faq_key: item._key,
                      recruitment_cycle_id: recruitmentCycleId,
                    })
                : undefined
            }
          />
        ))}
      </Accordion.Root>
    </RecruitSectionLayout>
  );
}

export default FAQ;
