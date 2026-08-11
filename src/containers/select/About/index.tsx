import { Link } from 'gatsby';
import { useBreakpoint } from 'gatsby-plugin-breakpoints';
import { GatsbyImage } from 'gatsby-plugin-image';
import tw from 'tailwind-styled-components';

import useAboutDetail from './hook';

function About() {
  const { aboutImgData, smallarrow, listImgData, aboutDescription } =
    useAboutDetail();
  const breakpoints = useBreakpoint();

  return (
    <Container
      $windowSize={!breakpoints.query669}
      className="flex items-center justify-center xs:flex-col sm:flex-col md:flex-col"
    >
      {aboutImgData.image && (
        <AboutImage image={aboutImgData.image} alt={aboutImgData.name} />
      )}
      <SubContainer className="flex flex-col items-start justify-center sm:items-center">
        <SubContainerTop className="flex flex-col items-start sm:items-center sm:justify-center">
          <div className="flex items-center">
            <Title>ABOUT YOURSSU</Title>
            <Link to="/">
              <img
                src={smallarrow.publicURL}
                alt={smallarrow.name}
                className="pl-[7px]"
              />
            </Link>
          </div>
          <AboutTitle>
            유어슈는 여러분의 더 나은 <br /> 캠퍼스라이프를 위해 달립니다.
          </AboutTitle>
        </SubContainerTop>

        <ListSection className="flex flex-col">
          {aboutDescription.map((value, index) => {
            return (
              <List className="flex justify-start" key={index!}>
                <ListImage src={listImgData.publicURL} alt={listImgData.name} />
                <ListItem>{value}</ListItem>
              </List>
            );
          })}
        </ListSection>
      </SubContainer>
    </Container>
  );
}
const Container = tw.div<{ $windowSize: boolean }>`
  bg-white-0

  rounded-[30px]

  py-8
  px-10
  ${(prop) => (prop.$windowSize ? 'sm:px-[160px]' : 'sm:px-[20px]')}
  xs:px-[20px]
  
  w-[1220px]
  lg:w-[1080px]
  md:w-[720px]
  ${(prop) => (prop.$windowSize ? 'sm:w-[640px]' : 'sm:w-[310px]')}
  xs:w-[310px]

  gap-[40px]
  sm:gap-[15px]
  xs:gap-[15px]
  
`;

const AboutImage = tw(GatsbyImage)`
  w-[498px]
  xs:w-[255px]
  sm:w-[255px]
`;

const SubContainer = tw.div`
  w-auto
  sm:w-[216px]
  h-full 
  
  gap-[40px] 
  sm:gap-[20px]
  xs:gap-[20px]
`;

const SubContainerTop = tw.div`
  gap-[20px]
  sm:gap-[14px]
`;

const Title = tw.span`
  jost5

  bg-gradient-to-r 
  from-mainGra1-0
  to-mainGra2-0
  bg-clip-text
  text-transparent
`;

const AboutTitle = tw.p`
  h3
  sm:text-[18px]
  sm:text-center
  xs:text-[18px]
  xs:text-center
`;

const ListSection = tw.div`
  w-full
  h-auto
  gap-[12px]
`;

const List = tw.div`
  w-max
  sm:w-full
  h-auto
  gap-[12px]
`;

const ListImage = tw.img`
  w-[24px]
  sm:w-[20px]
`;

const ListItem = tw.p`
  text-Text_Color2-0
  body2
  md:body3
  sm:text-[12px]
  xs:text-[12px]
`;

export default About;
