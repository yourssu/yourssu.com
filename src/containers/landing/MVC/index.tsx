import SectionIntro from '@/components/Intro/SectionIntro';
import SectionContainer from '@/containers/landing/MVC/SectionContainer';
import useMVCDetail from '@/containers/landing/MVC/hook';

function MVC() {
  const { items, coreValueItems } = useMVCDetail();

  return (
    <div className="flex w-full flex-col items-center gap-[115px] bg-[#F5F5F5] py-[140px] xs:py-20 sm:py-[110px] md:py-[120px]">
      <SectionIntro title="MVC" linerColor="gra" textColor="ver1" />
      <div className="flex px-5 xs:px-0">
        <div className="flex w-full max-w-[890px] flex-col gap-12 xs:max-w-[240px] sm:max-w-[440px] md:max-w-[760px]">
          <div className="flex w-full gap-8 xs:flex-col sm:flex-col">
            {items.map((item) => (
              <SectionContainer key={item.title} title={item.title}>
                <div className="body2 xs:body9 sm:body7">
                  {item.description}
                </div>
              </SectionContainer>
            ))}
          </div>
          <SectionContainer title={'CORE-VALUE'}>
            <div className="grid grid-cols-2 gap-x-7 gap-y-12 xs:grid-cols-1 sm:grid-cols-1">
              {coreValueItems.map((item) => (
                <div className="flex flex-col gap-2" key={item.title}>
                  <h4 className="h4 sm:body4 xs:body6">{item.title}</h4>
                  <p className="body2 sm:body7 xs:body9">{item.description}</p>
                </div>
              ))}
            </div>
          </SectionContainer>
        </div>
      </div>
    </div>
  );
}

export default MVC;
