import { MainPageData } from '@/types/mainPage';

import { MainCard } from './MainCard';

interface BannerProps {
  data: MainPageData['hero'];
}

function Banner({ data }: BannerProps) {
  return (
    <div className="flex flex-col items-center gap-[10px] self-stretch pb-20 pt-40 xs:pb-5 xs:pt-[76px] sm:pb-5 sm:pt-[76px]">
      <MainCard
        images={data.images.map(({ asset }) => asset.url)}
        text={data.title}
        buttonText={data.buttonText}
        buttonLink={data.buttonLink}
      />
    </div>
  );
}

export default Banner;
