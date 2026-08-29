import { useState } from 'react';

import type { MainContentAnalytics } from '@/analytics/contracts';
import { trackMainRecruitingContentCardClick } from '@/analytics/events';
import { Tag } from '@/components/Tag/Tag';

interface ContentsCardProps {
  title: string;
  tagNames: string[];
  imageUrl: string;
  contentUrl: string;
  contentId: string;
  contentPosition: number;
  analytics: MainContentAnalytics;
}

export function ContentsCard({
  title,
  tagNames,
  imageUrl,
  contentUrl,
  contentId,
  contentPosition,
  analytics,
}: ContentsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <a
      href={contentUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={title}
      onClick={() =>
        trackMainRecruitingContentCardClick({
          ...analytics,
          content_id: contentId,
          content_position: contentPosition,
        })
      }
    >
      <div
        className="inline-flex flex-col items-start justify-center gap-[20px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-[200px] w-[340px] items-center justify-center overflow-hidden rounded-[16px]">
          <img
            src={imageUrl}
            alt={`${title} thumbnail`}
            className="group-hover:scale-105 h-full w-full object-cover transition-transform duration-300"
          />
        </div>
        <div className="flex w-full flex-col items-start gap-[12px] px-[8px] py-0 opacity-80">
          <span
            className={`T3_Sb_20 sm:B1_Sb_16 xs:B1_Sb_16 whitespace-pre-line text-left ${
              isHovered ? 'text-text-brandPrimary' : 'text-text-basicPrimary'
            }`}
          >
            {title}
          </span>
          <div className="flex-start flex gap-[8px]">
            {tagNames.map((tagName) => (
              <Tag key={tagName} name={tagName} />
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}
