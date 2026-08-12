import * as Accordion from '@radix-ui/react-accordion';

import RecruitSectionLayout from '@/components/Layout/RecruitSectionLayout';
import RecruitTitle from '@/components/Title/RecruitTitle';
import { RecruitingPageData } from '@/types/recruitingPage';

import QuestionCard from './QuestionCard';
import { QuestionIcon } from './icons';

interface FAQProps {
  data: RecruitingPageData['faq'];
}

function FAQ({ data }: FAQProps) {
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
        {data.items.map((item) => (
          <QuestionCard key={item._key} {...item} />
        ))}
      </Accordion.Root>
    </RecruitSectionLayout>
  );
}

export default FAQ;
