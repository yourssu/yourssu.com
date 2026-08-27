import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import tw from 'tailwind-styled-components';

import type { JdTeamName } from '@/analytics/contracts';
import { trackJdExternalContentCardClick } from '@/analytics/events';
import {
  RoadToProInformation,
  VideoInformation,
} from '@/types/recruiting.type';

import useRoadToProDetail from './hook';

interface RoadToProProps {
  roadToPro: RoadToProInformation;
  teamName: JdTeamName;
}

function RoadToPro({ roadToPro, teamName }: RoadToProProps) {
  const data = useRoadToProDetail();
  const videos =
    roadToPro?.roadToPro_list?.filter((video): video is VideoInformation =>
      Boolean(
        video?.video_thumbnail?.asset?.gatsbyImageData &&
        video.video_link &&
        Array.isArray(video.presenter),
      ),
    ) ?? [];

  // roadToPro 정보가 없는 경우 해당 섹션을 보여주지 않음
  if (videos.length === 0) return null;

  return (
    <section className="flex flex-col items-start gap-6 self-stretch rounded-[12px] border border-line-basicLight p-6 xs:p-5 sm:p-5">
      <div className="T3_Sb_20 sm:T2_Sb_18 xs:T2_Sb_18 text-text-basicPrimary">
        {roadToPro.title || 'Road to Pro'}
      </div>
      <VideoInfoContainer>
        {videos.map((video) => {
          const thumbnail = getImage(
            video.video_thumbnail.asset.gatsbyImageData,
          );
          return (
            <div key={video.video_link} className="flex flex-col gap-3">
              <VideoContainer
                href={video.video_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackJdExternalContentCardClick({
                    content_type: 'youtube',
                    page_type: 'jd',
                    team_name: teamName,
                  })
                }
              >
                {thumbnail && <Thumbnail image={thumbnail} alt="thumbnail" />}
                <Gradient src={data.gradientImg.publicURL} alt="gradient" />
                <PlayButton src={data.playIcon.publicURL} alt="play" />
              </VideoContainer>
              <p className="B1_Rg_16 text-text-basicPrimary">
                {video.presenter
                  .map(
                    ({ presenter_name, presenter_nickname }) =>
                      `${presenter_name} (${presenter_nickname})`,
                  )
                  .join(', ')}
              </p>
            </div>
          );
        })}
      </VideoInfoContainer>
    </section>
  );
}

export default RoadToPro;

const VideoInfoContainer = tw.div`
  flex
  flex-wrap

  gap-x-5
  md:gap-x-2
  sm:gap-x-2
  xs:gap-x-2

  gap-y-10
  md:gap-y-5
  sm:gap-y-5
  xs:gap-y-5
`;

const VideoContainer = tw.a`
  relative
  flex
  h-fit
  w-fit
`;

const Thumbnail = tw(GatsbyImage)`
  h-44
  md:h-[188px]
  sm:h-[188px]
  xs:h-[188px]

  w-80
  md:w-[336px]
  sm:w-[336px]
  xs:w-[336px]

  rounded-[12px]
`;

const Gradient = tw.img`
  h-44
  md:h-[188px]
  sm:h-[188px]
  xs:h-[188px]

  w-80
  md:w-[336px]
  sm:w-[336px]
  xs:w-[336px]

  absolute
  top-0
  rounded-[12px]
  opacity-10
`;

const PlayButton = tw.img`
  absolute
  left-1/2
  top-1/2
  -translate-x-1/2
  -translate-y-1/2
  transform

  w-[108px]
  xs:w-[91px]
  sm:w-[91px]
  md:w-[91px]
`;
