import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

import useCarouselDetail from '@/containers/landing/Project/hook';
import { OSType } from '@/types/landing.type';

interface Props {
  currentIndex: number;
  isType: OSType;
}

function CarouselContent({ currentIndex, isType }: Props) {
  const {
    carouselItemLinkImgData,
    carouselItemListImgData,
    projectImgData,
    projectData,
  } = useCarouselDetail();

  const linkImgData = {
    imgUrl: carouselItemLinkImgData.nodes[0].publicURL,
    imgName: carouselItemLinkImgData.nodes[0].name,
  };

  const listImgData = {
    imgUrl: carouselItemListImgData.nodes[0].publicURL,
    imgName: carouselItemListImgData.nodes[0].name,
  };

  return (
    <div
      className={`flex items-center justify-between xs:w-[240px] xs:flex-col xs:justify-between sm:flex-col sm:justify-between md:flex-col ${currentIndex === 4 ? 'xs:h-[400px] sm:h-[450px] md:h-[600px]' : 'xs:h-[500px] sm:h-[530px] md:h-[800px] md:justify-between'}`}
    >
      <div className="xs:hidden sm:hidden md:hidden">
        {currentIndex % 2 !== 0 && (
          <GatsbyImage
            alt={projectData[currentIndex].title}
            className="h-auto w-full max-w-[732px] lg:w-[530px]"
            image={projectImgData[currentIndex]?.image as IGatsbyImageData}
          />
        )}
      </div>
      <div className="relative flex flex-col items-start justify-center xs:mb-[5px] sm:mb-[5px] md:mb-[10px]">
        <span className="absolute -top-[75px] left-[5px] font-apple-neo text-[70px] font-extrabold leading-[115px] -tracking-[0.03em] text-[#000000] opacity-10 xs:-top-[60px] xs:left-[10px] xs:text-[40px] xs:-tracking-[0.05em] sm:-left-[20px] sm:-top-[65px] sm:text-[48px] sm:-tracking-[0.05em]">
          0{currentIndex + 1}
        </span>
        <div className="flex flex-col px-[50px] xs:px-[32px] sm:px-[10px]">
          <div className="flex flex-row items-center justify-start">
            <span className="text-black font-apple-neo text-[36px] font-semibold leading-[36px] -tracking-[0.01em] xs:text-[24px] sm:text-[24px]">
              {projectData[currentIndex].title}
            </span>
            <div>
              {projectData[currentIndex].link.length === 1 && (
                <a
                  href={projectData[currentIndex].link[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    className="pointer-events-none ml-[5px] h-[26px] w-[26px] cursor-pointer xs:h-[15px] xs:w-[15px] sm:h-[18px] sm:w-[21.46px]"
                    src={linkImgData.imgUrl}
                    alt={linkImgData.imgName}
                  />
                </a>
              )}
              {projectData[currentIndex].link.length === 2 && (
                <a
                  href={
                    isType === 'android'
                      ? projectData[currentIndex].link[0]
                      : projectData[currentIndex].link[1]
                  }
                >
                  <img
                    className="pointer-events-none ml-[5px] h-[26px] w-[26px] cursor-pointer xs:h-[15px] xs:w-[15px] sm:h-[18px] sm:w-[21.46px]"
                    src={linkImgData.imgUrl}
                    alt={linkImgData.imgName}
                  />
                </a>
              )}
            </div>
          </div>
          <span className="mt-[15px] w-[405px] font-apple-neo text-[22px] font-normal leading-[32px] -tracking-wider text-[#525252] xs:w-fit xs:text-[13px] xs:leading-[20px] sm:w-[266px] sm:text-[14px] sm:leading-[22px] md:mt-5">
            {projectData[currentIndex].description}
          </span>
          <div
            className={`mt-[35px] flex flex-col justify-between xs:hidden sm:hidden md:hidden ${currentIndex === 1 || currentIndex === 3 || currentIndex === 4 ? 'h-20' : 'h-[132px]'}`}
          >
            {projectData[currentIndex].list.map((listData) => (
              <div
                className="flex flex-row items-center justify-start"
                key={listData}
              >
                <img src={listImgData.imgUrl} alt={listImgData.imgName} />
                <p className="ml-[7px] font-apple-neo text-[24px] font-semibold leading-[24px] -tracking-wider text-[#525252]">
                  {listData}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="xs:hidden sm:hidden md:hidden">
        {currentIndex % 2 === 0 && currentIndex !== 4 && (
          <GatsbyImage
            alt={projectData[currentIndex].title}
            className="h-auto w-full max-w-[750px] lg:w-[530px]"
            image={projectImgData[currentIndex]?.image as IGatsbyImageData}
          />
        )}
        {currentIndex % 2 === 0 && currentIndex === 4 && (
          <GatsbyImage
            alt={projectData[currentIndex].title}
            className="h-auto lg:w-[550px] xl:w-[750px] xxl:w-[750px]"
            image={projectImgData[currentIndex]?.image as IGatsbyImageData}
          />
        )}
      </div>
      <div className="xs:mb-[5px] sm:mb-[5px] md:mb-[10px] lg:hidden xl:hidden xxl:hidden">
        <GatsbyImage
          alt={projectData[currentIndex].title}
          className="h-auto xs:w-[220px] sm:w-[300px] md:w-[400px]"
          image={projectImgData[currentIndex]?.image as IGatsbyImageData}
        />
      </div>
      <div className="flex w-[405px] flex-col justify-start xs:mb-[5px] xs:w-[210px] sm:mb-[5px] sm:w-[266px] md:mb-[10px] lg:hidden xl:hidden xxl:hidden">
        {projectData[currentIndex].list.map((listData) => (
          <div
            className="mb-5 flex flex-row items-center justify-start"
            key={listData}
          >
            <img
              className="xs:h-[15px] xs:w-[15px] sm:h-[18px] sm:w-[18px]"
              src={listImgData.imgUrl}
              alt={listImgData.imgName}
            />
            <p className="ml-[7px] font-apple-neo text-[24px] font-semibold -tracking-wider text-[#525252] xs:text-[14px] xs:leading-[14px] sm:text-[16px] sm:leading-[16px] md:leading-[24px]">
              {listData}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CarouselContent;
