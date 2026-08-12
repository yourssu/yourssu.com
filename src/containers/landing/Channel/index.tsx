import { MainPageData } from '@/types/mainPage';

import { ContentsCard } from './ContentsCard';

interface ChannelProps {
  data: MainPageData['channel'];
}

function Channel({ data }: ChannelProps) {
  return (
    <section className="flex h-full flex-col gap-[38px] py-[3.75rem] text-center xs:gap-6 xs:py-10 sm:gap-6 sm:py-10">
      <h3 className="T2_Sb_24 sm:T1_Sb_20 xs:T1_Sb_20">{data.title}</h3>

      <div
        className="flex w-full justify-center gap-5 xs:justify-start xs:overflow-x-scroll sm:justify-start sm:overflow-x-scroll md:justify-start md:overflow-x-scroll"
        id="scrollbar-hide"
      >
        {data.items.map((channel) => (
          <ContentsCard
            key={channel._key}
            title={channel.title}
            tagNames={channel.tags}
            imageUrl={channel.image.asset.url}
            contentUrl={channel.link}
          />
        ))}
      </div>
    </section>
  );
}

export default Channel;
