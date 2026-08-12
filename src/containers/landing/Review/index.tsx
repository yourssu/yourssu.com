import { motion } from 'motion/react';

import ReviewCard from './ReviewCard';
import { ReviewDataType, REVIEWS_DATA } from './mock';

const doubledReviews: ReviewDataType[] = [...REVIEWS_DATA, ...REVIEWS_DATA];

export function ReviewCarousel() {
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
            <div key={index} className="flex-shrink-0 px-4">
              <ReviewCard reviewData={review} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
