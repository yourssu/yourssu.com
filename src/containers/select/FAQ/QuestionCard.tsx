import * as Accordion from '@radix-ui/react-accordion';
import tw from 'tailwind-styled-components';

import {
  getFaqToggleAction,
  type JdTeamName,
  type PageType,
} from '@/analytics/contracts';
import { trackFaqToggleClick } from '@/analytics/events';
import smallArrowImg from '@/assets/icons/smallarrow-left.svg';

import { QuestionEmptyIcon, QuestionFillIcon } from './icons';

export default function QuestionCard({
  question,
  answer,
  faqKey,
  faqPosition,
  link,
  onAnswerLinkClick,
  pageType,
  recruitmentCycleId,
  teamName,
}: {
  question: string;
  answer: string;
  faqKey: string;
  faqPosition: number;
  link?: { label: string; href: string };
  onAnswerLinkClick?: () => void;
  pageType: PageType;
  recruitmentCycleId: string;
  teamName?: JdTeamName;
}) {
  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index} className="font-bold">
          {part.substring(2, part.length - 2)}
        </strong>
      ) : (
        part
      ),
    );
  };

  return (
    <Accordion.Item value={faqKey} className="w-full">
      <Container>
        <Accordion.Header>
          <Accordion.Trigger
            className="group flex w-full items-center justify-between"
            onClick={(event) => {
              const toggleAction = getFaqToggleAction(
                event.currentTarget.dataset.state,
              );
              if (!toggleAction) return;

              trackFaqToggleClick({
                faq_key: faqKey,
                faq_position: faqPosition,
                page_type: pageType,
                recruitment_cycle_id: recruitmentCycleId,
                ...(teamName ? { team_name: teamName } : {}),
                toggle_action: toggleAction,
              });
            }}
          >
            <div className="flex items-center gap-[12px] text-left xs:gap-[8px] sm:gap-[8px]">
              <div className="relative h-6 w-6 flex-shrink-0">
                <QuestionEmptyIcon className="absolute inset-0 transition-opacity duration-300 group-data-[state=closed]:opacity-100 group-data-[state=open]:opacity-0" />
                <QuestionFillIcon className="absolute inset-0 transition-opacity duration-300 group-data-[state=closed]:opacity-0 group-data-[state=open]:opacity-100" />
              </div>
              <p className="group-data-[state=open]:T3_Sb_20 group-data-[state=closed]:T3_Rg_20 sm:B1_Sb_16 sm:group-data-[state=closed]:B1_Rg_16 sm:group-data-[state=open]:B1_Sb_16 xs:B1_Sb_16 xs:group-data-[state=closed]:B1_Rg_16 xs:group-data-[state=open]:B1_Sb_16 group-data-[state=closed]:text-text-basicSecondary group-data-[state=open]:text-text-basicPrimary">
                {question}
              </p>
            </div>
            <QuestionIcon
              className="group-data-[state=open]:rotate-90"
              src={smallArrowImg}
              alt=""
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content className="overflow-hidden text-left data-[state=closed]:animate-accordion-slide-up data-[state=open]:animate-accordion-slide-down">
          <AnswerBox>
            <div className="B1_Rg_16 sm:B3_Rg_14 xs:B3_Rg_14 whitespace-pre-wrap text-text-basicSecondary">
              {answer.split('\n').map((line, lineIndex) => (
                <div key={lineIndex}>{renderBoldText(line)}</div>
              ))}
              {link && (
                <a
                  href={link.href}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onAnswerLinkClick}
                >
                  {link.label}
                </a>
              )}
            </div>
          </AnswerBox>
        </Accordion.Content>
      </Container>
    </Accordion.Item>
  );
}

const Container = tw.div`
  w-full
  flex
  flex-col

  rounded-[12px] 
  bg-white-0 
  p-6
  gap-6

  sm:p-5
  xs:p-5

  border
  border-line-basicLight
`;

const QuestionIcon = tw.img`
  h-[12px]
  -rotate-90
`;

const AnswerBox = tw.div`
  bg-bluegray4-0
  rounded-[12px]
  px-[36px]
  py-[24px]
  sm:px-[20px]
  sm:py-[16px]
  xs:px-[20px]
  xs:py-[16px]
`;
