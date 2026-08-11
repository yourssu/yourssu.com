import * as Accordion from '@radix-ui/react-accordion';
import { useBreakpoint } from 'gatsby-plugin-breakpoints';
import tw from 'tailwind-styled-components';

import smallArrowImg from '@/assets/icons/smallarrow-left.svg';

import { QuestionEmptyIcon, QuestionFillIcon } from './icons';

export default function QuestionCard({
  question,
  answer,
}: {
  question: string;
  answer: string | React.ReactNode;
}) {
  const breakpoints = useBreakpoint();

  // 볼드체 변환 함수
  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold">
            {part.substring(2, part.length - 2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <Accordion.Item value={question} className="w-full">
      <Accordion.Trigger className="group w-full">
        <Container $windowSize={!breakpoints.query550}>
          <div className="flex items-center justify-between">
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
              alt={'small arrow icon'}
            />
          </div>

          <Accordion.Content className="overflow-hidden text-left data-[state=closed]:animate-accordion-slide-up data-[state=open]:animate-accordion-slide-down">
            <AnswerBox>
              <div className="B1_Rg_16 sm:B3_Rg_14 xs:B3_Rg_14 whitespace-pre-wrap text-text-basicSecondary">
                {/* 문자열일 때만 split과 볼드체 처리 */}
                {typeof answer === 'string'
                  ? answer
                      .split('\\n')
                      .map((line, lineIdx) => (
                        <div key={lineIdx}>{renderBoldText(line)}</div>
                      ))
                  : // 문자열이 아닌(이미 Element인) 경우 그대로 출력
                    answer}
              </div>
            </AnswerBox>
          </Accordion.Content>
        </Container>
      </Accordion.Trigger>
    </Accordion.Item>
  );
}

const Container = tw.div<{ $windowSize: boolean }>`
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

  cursor-pointer
`;

const QuestionIcon = tw.img`
  h-[12px]
  
  -rotate-90
`;

const AnswerBox = tw.div`
  // bg-[#F7F8F8]
  bg-bluegray4-0
  rounded-[12px]
  px-[36px]
  py-[24px]
  sm:px-[20px]
  sm:py-[16px]
  xs:px-[20px]
  xs:py-[16px]
`;
