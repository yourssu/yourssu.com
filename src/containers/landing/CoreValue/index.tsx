import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import MainTitle from '@/components/Title/MainTitle';
import { MainPageData } from '@/types/mainPage';

import { ValueCard } from './ValueCard';

interface CoreValueProps {
  data: MainPageData['coreValue'];
}

function CoreValue({ data }: CoreValueProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative z-0 mx-auto flex w-full max-w-[1060px] flex-col items-center justify-center gap-9 py-20 xs:gap-6 xs:py-10 sm:gap-6 sm:py-10">
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-10 bg-black-0 bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <MainTitle title={data.title} subTitle={data.subtitle} />

      <div
        className="relative flex flex-wrap justify-center gap-4 xs:w-full xs:gap-2 sm:w-full sm:gap-2 md:w-[700px]"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {data.items.map((content, index) => (
          <ValueCard
            key={content._key}
            content={content}
            isHovered={hoveredIndex === index}
            onMouseEnter={() => setHoveredIndex(index)}
          />
        ))}
      </div>
      <p className="B5_Rg_12 hidden text-center text-text-basicTertiary xs:block sm:block">
        카드를 눌러 내용을 확인해보세요
        <br />
        PC환경에서는 더 자세한 내용을 확인할 수 있습니다
      </p>
    </section>
  );
}

export default CoreValue;
