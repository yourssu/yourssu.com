import { useRef, useState, useEffect } from 'react';

import type { TfName } from '@/analytics/contracts';
import { trackMainTfCardClick } from '@/analytics/events';
import MainTitle from '@/components/Title/MainTitle';
import { MainPageData } from '@/types/mainPage';

import { ProductCard } from './ProductCard';
import { ArrowLeftIcon, ArrowRightIcon } from './arrowIcons';

interface ProductProps {
  analyticsByKey: ReadonlyMap<string, TfName>;
  data: MainPageData['product'];
}

function Product({ analyticsByKey, data }: ProductProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsInView, setItemsInView] = useState(3);

  const cardWidth = 332;
  const gap = 24;

  // 1. 화면 너비에 따라 몇 개를 보여줄지 결정 (컨테이너 너비를 결정짓는 기준)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 721)
        setItemsInView(1); // 카드 1개 너비 + 여유
      else if (width < 1081)
        setItemsInView(2); // 카드 2개 + 간격 1개 너비
      else setItemsInView(3); // 카드 3개 + 간격 2개 너비

      setCurrentPage(0);
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const maxPage = Math.ceil(data.items.length / itemsInView) - 1;
      let nextPage =
        direction === 'left'
          ? Math.max(0, currentPage - 1)
          : Math.min(maxPage, currentPage + 1);

      setCurrentPage(nextPage);

      // 한 페이지(세트)만큼 정확히 이동
      const moveDistance = (cardWidth + gap) * itemsInView;
      scrollRef.current.scrollTo({
        left: nextPage * moveDistance,
        behavior: 'smooth',
      });
    }
  };

  const remaining =
    (itemsInView - (data.items.length % itemsInView)) % itemsInView;

  return (
    <section className="mx-auto flex w-full flex-col py-20 xs:py-10 sm:py-10">
      <div className="mx-auto w-[1044px] xs:w-[332px] sm:w-[332px] md:w-[688px] lg:w-[1044px]">
        <div className="flex flex-col gap-9 transition-all duration-300 xs:gap-6 sm:gap-6">
          {/* 헤더 영역: 컨테이너 너비에 맞춰 정렬됨 */}
          <MainTitle
            title={data.title}
            subTitle={data.subtitle}
            rightElement={
              <div className="border-line-basic-medium flex h-12 w-[90px] items-center justify-center gap-7 rounded-[29px] border px-[9px] py-2 xs:h-8 xs:w-[60px] xs:gap-[18.667px] xs:px-[6px] xs:py-[5.333px] sm:h-8 sm:w-[60px] sm:gap-[18.667px] sm:px-[6px] sm:py-[5.333px]">
                <button onClick={() => scroll('left')}>
                  <ArrowLeftIcon className="flex h-4 w-4 flex-shrink-0 items-center justify-center xs:h-[10.67px] xs:w-[10.67px] sm:h-[10.67px] sm:w-[10.67px]" />
                </button>
                <button onClick={() => scroll('right')}>
                  <ArrowRightIcon className="flex h-4 w-4 flex-shrink-0 items-center justify-center xs:h-[10.67px] xs:w-[10.67px] sm:h-[10.67px] sm:w-[10.67px]" />
                </button>
              </div>
            }
          />

          {/* 카드 리스트 영역: overflow-hidden으로 잘림 방지 */}
          <div className="relative w-full overflow-hidden">
            <div
              ref={scrollRef}
              className="scrollbar-hide flex gap-6 overflow-x-hidden"
            >
              {data.items.map((product) => (
                <div key={product._key} className="w-[332px] flex-shrink-0">
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackMainTfCardClick({
                        tf_name: analyticsByKey.get(product._key)!,
                      })
                    }
                  >
                    <ProductCard
                      title={product.title}
                      description={product.description}
                      imageUrl={product.image.asset.url}
                    />
                  </a>
                </div>
              ))}
              {/* 부족한 칸 채우기 */}
              {Array.from({ length: remaining }).map((_, i) => (
                <div key={`empty-${i}`} className="w-[332px] flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Product;
