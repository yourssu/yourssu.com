import { motion } from 'motion/react';

import { MainPageData } from '@/types/mainPage';

import ReviewCard from './ReviewCard';

interface ReviewCarouselProps {
  data: MainPageData['reviews'];
}

export function ReviewCarousel({ data }: ReviewCarouselProps) {
  const doubledReviews = [...data, ...data];
  const carouselVariants = {
    animate: {
      x: ['0%', '-50%'],
      transition: {
        ease: 'linear' as const,
        duration: 100,
        repeat: Infinity,
      },
    },
  };

  return (
    <section className="relative w-full pb-10 pt-20 xs:-mx-5 xs:w-[calc(100%+40px)] sm:-mx-5 sm:w-[calc(100%+40px)]">
      <div className="overflow-hidden">
        <motion.div
          className="flex w-max"
          variants={carouselVariants}
          animate="animate"
        >
          {doubledReviews.map((review, index) => (
            <div key={`${review._key}-${index}`} className="flex-shrink-0 px-4">
              <ReviewCard reviewData={review} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
