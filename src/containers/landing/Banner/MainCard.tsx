import { navigate } from 'gatsby';
import { useState, useEffect } from 'react';

import { trackMainRecruitingCtaClick } from '@/analytics/events';
import { BoxButton } from '@/components/Button/BoxButton';

interface MainCardProps {
  images: string[];
  text: string;
  buttonText: string;
  buttonLink: string;
}

export function MainCard({
  images,
  text,
  buttonText,
  buttonLink,
}: MainCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 3초마다 인덱스 변경
  useEffect(() => {
    // 이미지를 프리로딩해 최초 진입 시 느려지는 현상 방지
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const time = currentIndex === 0 ? 2000 : 3000;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, time);

    return () => clearInterval(timer);
  }, [images, currentIndex]);

  return (
    <div className="flex-end relative flex h-[535px] w-full max-w-[1060px] flex-col justify-between overflow-hidden rounded-[16px] px-[72px] py-[40px] xs:h-[243px] xs:w-[370px] xs:p-[20px] sm:h-[243px] sm:w-[370px] sm:p-[20px]">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`bg-${index}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="bg-black/30 absolute inset-0" />
      <div className="relative z-10 flex h-full flex-col items-start justify-between text-left">
        <span className="H1_Sb_32 sm:T1_Sb_20 xs:T1_Sb_20 whitespace-pre-line text-text-basicWhite">
          {text}
        </span>
        <div className="self-end">
          <BoxButton
            onClick={() => {
              trackMainRecruitingCtaClick({
                cta_label: 'view_positions',
                cta_location: 'hero',
              });
              navigate(buttonLink);
            }}
          >
            {buttonText}
          </BoxButton>
        </div>
      </div>
    </div>
  );
}
