import {
  useMotionValueEvent,
  useScroll,
  AnimatePresence,
  motion,
} from 'motion/react';
import { useRef, useState } from 'react';

import { MainPageData } from '@/types/mainPage';

interface MissionVisionProps {
  data: MainPageData['missionVision'];
}

function MissionVision({ data }: MissionVisionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'], // 대상의 시작점이 뷰포트 시작점에 닿을 때 시작, 대상의 끝이 뷰포트 끝에 닿을 때 끝
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const newIndex = Math.min(
      Math.floor(latest * data.length),
      data.length - 1,
    );

    setCurrentIndex(newIndex);
  });

  // 현재 인덱스에 맞는 콘텐츠를 가져옵니다.
  const activeContent = data[currentIndex];

  return (
    <section
      ref={scrollRef}
      style={{ height: `${data.length * 100}vh`, position: 'relative' }}
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
                  activeContent.image &&
                  `url(${activeContent.image.asset.url})`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex h-[150px] shrink-0 flex-col items-start gap-9 self-stretch xs:h-[112px] xs:gap-3 sm:h-[112px] sm:gap-3">
                <div className="flex flex-col items-center gap-1 self-stretch">
                  <div className="B3_Rg_14 sm:C1_Rg_11 xs:C1_Rg_11 text-center text-text-basicTertiary">
                    {activeContent.subtitle}
                  </div>
                  <div className="T2_Sb_24 sm:T2_Sb_18 xs:T2_Sb_18 text-center text-text-basicPrimary">
                    {activeContent.title}
                  </div>
                </div>
                <div className="T4_Rg_18 sm:B5_Rg_12 xs:B5_Rg_12 self-stretch whitespace-pre-wrap text-center text-text-basicSecondary">
                  {/* 데스크탑용 문구: sm(640px) 이상에서만 보임 */}
                  <p className="block xs:hidden sm:hidden">
                    {activeContent.desktopDescription}
                  </p>

                  {/* 모바일용 문구: sm 이상에서는 숨김 */}
                  <p className="hidden xs:block sm:block">
                    {activeContent.mobileDescription}
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

export default MissionVision;
