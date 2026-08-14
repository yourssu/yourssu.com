import { useBreakpoint } from 'gatsby-plugin-breakpoints';
import { useEffect, useRef, useState } from 'react';
import tw from 'tailwind-styled-components';

import { ApplyProcedureInformation } from '@/types/recruiting.type';

import ProcedureLargeSVG from './ProcedureLargeSVG';
import ProcedureSmallSVG from './ProcedureSmallSVG';
import WarningDescription from './WarningDescription';
import useApplyProcedureDetail from './hook';

interface ApplyProcedureProps {
  applyProcedure: ApplyProcedureInformation[] | null;
}

function ApplyProcedure({ applyProcedure }: ApplyProcedureProps) {
  const data = useApplyProcedureDetail();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const warningRef = useRef<HTMLDivElement>(null);
  const breakpoints = useBreakpoint();

  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (
        isWarningOpen &&
        !warningRef.current?.contains(e.target as HTMLDivElement)
      )
        setIsWarningOpen(false);
    };
    document.addEventListener('mousedown', handleClose);

    return () => document.removeEventListener('mousedown', handleClose);
  }, [isWarningOpen]);

  // 리크루팅을 안하면 null 반환
  if (!applyProcedure || applyProcedure.length === 0) return null;

  return (
    <section className="inline-flex flex-col items-start justify-start gap-6 self-stretch rounded-[12px] p-6 outline outline-1 outline-offset-[-1px] outline-[#F1F1F4] xs:p-5 sm:p-5">
      <TitleContainer>
        <div className="T3_Sb_20 sm:T2_Sb_18 xs:T2_Sb_18 text-text-basicPrimary">
          합류 여정
        </div>
        {/* <NoticeButton
          type="button"
          onClick={() => {
            setIsWarningOpen((prev) => !prev);
          }}
        >
          <img src={data.warningLightIcon.publicURL} alt="정보 더보기" />
          <NoticeText>주의사항을 반드시 읽어주세요</NoticeText>
        </NoticeButton> */}
        {isWarningOpen && (
          <WarningDescription
            iconURL={data.warningDarkIcon.publicURL}
            warningRef={warningRef}
          />
        )}
      </TitleContainer>
      {/* 합류 일정 그래프 부분 */}
      <div className="flex items-center gap-6 self-stretch px-3 py-0 xs:items-end xs:justify-center sm:items-end sm:justify-center">
        {/* 왼쪽: 날짜 */}
        <div className="B2_Sb_15 sm:B4_Rg_13 xs:B4_Rg_13 flex min-w-fit flex-col items-end justify-center gap-8 bg-gradient-to-b from-mainGra1-0 to-mainGra2-0 bg-clip-text text-transparent">
          {applyProcedure.map((item) => (
            <div key={item.schedule}>{item.schedule}</div>
          ))}
        </div>
        {breakpoints.sm ? (
          <ProcedureSmallSVG count={applyProcedure.length} />
        ) : (
          <ProcedureLargeSVG count={applyProcedure.length} />
        )}
        {/* 오른쪽: 전형 단계 */}
        <div className="B2_Rg_15 sm:B4_Rg_13 xs:B4_Rg_13 flex flex-col gap-8 text-text-basicSecondary xs:justify-center sm:justify-center">
          {applyProcedure.map((item) => (
            <div key={item.schedule}>
              {item.step === '지원서 접수 (~03.08 23:59까지)' ? (
                <p className="justify-start">
                  지원서 접수
                  <br className="hidden xs:block sm:block" />
                  (~03.08 23:59까지)
                </p>
              ) : (
                item.step
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 rounded-[12px] bg-bg-basicLight p-4">
        <div className="flex items-center gap-2 self-stretch">
          <img src={data.warningDarkIcon.publicURL} alt="정보 더보기" />
          <div className="B1_Sb_16 text-text-basicPrimary">
            지원 시 유의사항
          </div>
        </div>
        <ul className="B1_Rg_16 sm:B3_Rg_14 xs:B3_Rg_14 flex list-outside list-disc flex-col gap-1 pl-5 text-text-basicSecondary">
          <li>
            기재된 내용이 사실과 다를 경우 합격이 취소될 수 있음을 유의하여
            주시길 바랍니다.
          </li>
          <li>
            전형 일정 및 결과는 지원서 작성 시 기재해주신 이메일을 통해 일주일
            이내로 안내드립니다.
          </li>
          <li>인큐베이팅 기간은 유동적으로 변경 될 수 있음을 알려드립니다.</li>
        </ul>
      </div>
    </section>
  );
}

export default ApplyProcedure;

const TitleContainer = tw.div`
  relative

  flex
  items-center
  flex-wrap
  gap-3
`;

// const NoticeText = tw.span`
//   body4
//   md:body6
//   sm:body6
//   xs:body6
//   text-gray2-0
// `;

// const NoticeButton = tw.button`
//   flex
//   gap-1
//   items-center
// `;
