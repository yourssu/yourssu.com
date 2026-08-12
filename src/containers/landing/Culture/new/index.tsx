import MainTitle from '@/components/Title/MainTitle';
import { MainPageData } from '@/types/mainPage';

import { CultureCard } from './CultureCard';

interface CultureProps {
  data: MainPageData['culture'];
}

function Culture({ data }: CultureProps) {
  return (
    <section className="flex w-full flex-col items-center gap-8 py-20 xs:gap-6 xs:py-10 sm:gap-6 sm:py-10">
      <MainTitle title={data.title} subTitle={data.subtitle} />

      <div className="mb-6 flex flex-col items-center gap-9 xs:gap-4 sm:gap-4">
        {data.items.map((item) => (
          <CultureCard
            key={item._key}
            tagName={item.tag}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}

export default Culture;
