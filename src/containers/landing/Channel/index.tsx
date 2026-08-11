import { ContentsCard } from './ContentsCard';
import { CHANNELS_DATA } from './mock';

function Channel() {
  return (
    <section className="flex h-full flex-col gap-[38px] py-[3.75rem] text-center xs:gap-6 xs:py-10 sm:gap-6 sm:py-10">
      <h3 className="T2_Sb_24 sm:T1_Sb_20 xs:T1_Sb_20">
        다양한 채널에서 유어슈를 만나보세요
      </h3>

      <div
        className="flex w-full justify-center gap-5 xs:justify-start xs:overflow-x-scroll sm:justify-start sm:overflow-x-scroll md:justify-start md:overflow-x-scroll"
        id="scrollbar-hide"
      >
        {CHANNELS_DATA.map((channel) => (
          <ContentsCard
            key={channel.title}
            title={channel.title}
            tagNames={channel.tagNames}
            imageUrl={channel.imageUrl}
            contentUrl={channel.link}
          />
        ))}
      </div>
    </section>
  );
}

export default Channel;
