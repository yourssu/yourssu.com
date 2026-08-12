import {
  useMotionValueEvent,
  useScroll,
  AnimatePresence,
  motion,
} from 'motion/react';
import { useRef, useState } from 'react';

import missionImage from '@/assets/images/mvc/MISSION.png';
import mvcImage from '@/assets/images/mvc/MVC.png';
import visionImage from '@/assets/images/mvc/VISION.png';

function MissionVision() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'], // 대상의 시작점이 뷰포트 시작점에 닿을 때 시작, 대상의 끝이 뷰포트 끝에 닿을 때 끝
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const newIndex = Math.min(
      Math.floor(latest * contentData.length),
      contentData.length - 1,
    );

    setCurrentIndex(newIndex);
  });

  // 현재 인덱스에 맞는 콘텐츠를 가져옵니다.
  const activeContent = contentData[currentIndex];

  return (
    <section
      ref={scrollRef}
      style={{ height: `${contentData.length * 100}vh`, position: 'relative' }}
      className="ml-[50%] h-[300vh] w-screen -translate-x-1/2 xs:h-[200vh] sm:h-[200vh]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center">
        <motion.div className="h-[500px] w-full min-w-96 max-w-full flex-col items-center justify-center xs:h-[450px] sm:h-[450px]">
          {/* 비전 콘텐츠가 들어가는 div */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="flex size-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-center"
              style={{
                backgroundImage:
                  activeContent.bgImageUrl &&
                  `url(${activeContent.bgImageUrl})`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex h-[150px] shrink-0 flex-col items-start gap-9 self-stretch xs:h-[112px] xs:gap-3 sm:h-[112px] sm:gap-3">
                <div className="flex flex-col items-center gap-1 self-stretch">
                  <div className="B3_Rg_14 sm:C1_Rg_11 xs:C1_Rg_11 text-center text-text-basicTertiary">
                    {activeContent.subTitle}
                  </div>
                  <div className="T2_Sb_24 sm:T2_Sb_18 xs:T2_Sb_18 text-center text-text-basicPrimary">
                    {activeContent.title}
                  </div>
                </div>
                <div className="T4_Rg_18 sm:B5_Rg_12 xs:B5_Rg_12 self-stretch whitespace-pre-wrap text-center text-text-basicSecondary">
                  {/* 데스크탑용 문구: sm(640px) 이상에서만 보임 */}
                  <p className="block xs:hidden sm:hidden">
                    {activeContent.description.desktop}
                  </p>

                  {/* 모바일용 문구: sm 이상에서는 숨김 */}
                  <p className="hidden xs:block sm:block">
                    {activeContent.description.mobile}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

const contentData = [
  {
    title: '유어슈의 미션, 비전, 핵심가치',
    subTitle: 'MVC',
    description: {
      desktop:
        '유어슈는 서비스로 세상에 의미 있는 변화를 만들기 위해,\n기존 숭실대학교를 넘어 더 넓은 무대를 바라보며 MVC 3.0을 설정했습니다.',
      mobile:
        '유어슈는 서비스로 세상에 의미 있는 변화를 만들기 위해,\n숭실대학교를 넘어 더 넓은 무대를 바라보며 MVC 3.0을 설정했습니다.',
    },
    bgImageUrl: mvcImage,
  },
  {
    title: 'MISSION',
    subTitle: 'YOURSSU',
    description: {
      desktop:
        '유어슈는 숭실대 학생들과 함께 성장하며,\n서비스로 세상에 의미 있는 변화를 만든다.',
      mobile:
        '유어슈는 숭실대 학생들과 함께 성장하며,\n서비스로 세상에 의미 있는 변화를 만든다.',
    },
    bgImageUrl: missionImage,
  },
  {
    title: 'VISION',
    subTitle: 'YOURSSU',
    description: {
      desktop:
        '2년 내 유어슈가 만든 서비스 중 최소 1개 이상이\n외부 사용자 1,000명 이상에게 실제로 사용되며 가치를 인정받는 것을 목표로 한다',
      mobile:
        '2년 내 유어슈가 만든 서비스 중 최소 1개 이상이\n외부 사용자 1,000명 이상에게\n실제로 사용되며 가치를 인정받는 것을 목표로 한다',
    },
    bgImageUrl: visionImage,
  },
] as const satisfies Array<{
  title: string;
  subTitle: string;
  description: { desktop: string; mobile: string };
  bgImageUrl: string | undefined;
}>;

export default MissionVision;
