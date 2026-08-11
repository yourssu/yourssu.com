import { motion } from 'framer-motion';
import { useBreakpoint } from 'gatsby-plugin-breakpoints';

import { MVCContent } from './mock';

interface ValueCardProps {
  content: MVCContent;
  isHovered: boolean;
  onMouseEnter: () => void;
}

export function ValueCard({
  content,
  isHovered,
  onMouseEnter,
}: ValueCardProps) {
  const breakpoints = useBreakpoint();
  const isMobile = breakpoints.query550;

  const title = isMobile ? content.title.mobile : content.title.desktop;
  const summary = isMobile ? content.summary.mobile : content.summary.desktop;
  const description = isMobile
    ? content.description.mobile
    : content.description.desktop;

  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      className={`relative h-[16.25rem] w-[12.188rem] cursor-pointer overflow-hidden rounded-[1rem] transition-all duration-300 xs:h-[152px] xs:w-[108px] sm:h-[152px] sm:w-[108px] ${isHovered ? 'scale-105 z-20' : 'z-0'} `}
    >
      {/* 1. 배경 이미지 (고정) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
        style={{ backgroundImage: `url(${content.bgImageUrl})` }}
      />

      {/* 2. 앞면 (isHovered가 아닐 때만 노출) */}
      {!isHovered && (
        <div
          className={`absolute inset-0 flex flex-col items-start justify-start gap-[6px] px-[18px] py-[17px] xs:px-3 xs:py-4 sm:px-3 sm:py-4 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        >
          <h3 className="T3_Sb_20 xs:B1_Sb_16 sm:B1_Sb_16 whitespace-pre-wrap text-[#000]">
            {title}
          </h3>
          {!isMobile && (
            <p className="B1_Rg_16 whitespace-pre-wrap text-text-basicSecondary">
              {summary}
            </p>
          )}
        </div>
      )}

      {/* 3. 뒷면 (isHovered일 때만 노출) */}
      {isHovered && (
        <div
          className={`bg-white absolute inset-0 flex flex-col items-start justify-start bg-opacity-90 px-[14px] py-[17px] xs:items-center sm:items-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          {Array.isArray(description) ? (
            <div className="flex flex-col gap-1">
              {description.map((line, index) => (
                <p
                  key={index}
                  className="B1_Sb_16 animate-fadeIn text-text-basicPrimary"
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            /* 모바일 등 문자열 형태인 경우 */
            <p className="B1_Sb_16 sm:B2_Sb_15 xs:B2_Sb_15 animate-fadeIn whitespace-pre-wrap text-text-basicPrimary xs:text-center sm:text-center">
              {description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
