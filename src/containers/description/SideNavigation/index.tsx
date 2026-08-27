import { Link } from 'gatsby';
import tw from 'tailwind-styled-components';

import type { JdTeamName } from '@/analytics/contracts';
import { trackJdContactClick, trackJdToFaqClick } from '@/analytics/events';
import ApplyButton from '@/components/Button/ApplyButton';

import { ArrowLeft } from './ArrowLeft';
import useSideNavigationDetail from './hook';

const KAKAO_LINK = 'http://pf.kakao.com/_AxfrxeT';

interface SideNavigationProps {
  currentTeam: {
    name: string;
    isApplicationOpen: boolean;
    applyLink: string;
    recruitmentCycleId: string;
    teamName: JdTeamName;
  };
  teamList: { name: string; isRecruiting: boolean }[];
}

function SideNavigation({ currentTeam, teamList }: SideNavigationProps) {
  const data = useSideNavigationDetail();

  return (
    <Container>
      <NavigationContainer>
        <h2 className="T3_Sb_20">TEAM</h2>
        <NavigationList>
          {teamList.map(({ name, isRecruiting }) => {
            const isActive = currentTeam.name === name;
            const content = (
              <>
                <ArrowLeft isActive={isActive} isDisabled={!isRecruiting} />
                <div>{name}</div>
              </>
            );

            return isRecruiting ? (
              <NavigationItem
                to={`/recruiting/${name.toLowerCase().replaceAll(' ', '_')}`}
                key={name}
                $active={isActive}
              >
                {content}
              </NavigationItem>
            ) : (
              <DisabledNavigationItem key={name} aria-disabled="true">
                {content}
              </DisabledNavigationItem>
            );
          })}
        </NavigationList>
      </NavigationContainer>
      <ApplyButton
        link={currentTeam.applyLink}
        isApplicationOpen={currentTeam.isApplicationOpen}
        ctaLocation="desktop_sidebar"
        recruitmentCycleId={currentTeam.recruitmentCycleId}
        teamName={currentTeam.teamName}
      />
      <div className="flex w-full gap-5">
        <Link
          to="/recruiting/#faq"
          onClick={() =>
            trackJdToFaqClick({
              cta_location: 'desktop_sidebar',
              recruitment_cycle_id: currentTeam.recruitmentCycleId,
              team_name: currentTeam.teamName,
            })
          }
          className="inline-flex h-[130px] flex-1 flex-col items-center justify-between self-stretch overflow-hidden rounded-[12px] pt-3 outline outline-1 outline-offset-[-1px] outline-[#F1F1F4]"
        >
          <div className="B3_Sb_14 mb-[1px] items-center text-gray1-0">
            FAQ 보러가기
          </div>
          <img src={data.faqButton.publicURL} alt="FAQ 보러가기" />
        </Link>
        <a
          href={KAKAO_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackJdContactClick({
              cta_location: 'desktop_sidebar',
              recruitment_cycle_id: currentTeam.recruitmentCycleId,
              team_name: currentTeam.teamName,
            })
          }
          className="inline-flex h-[130px] flex-1 flex-col items-center justify-between self-stretch overflow-hidden rounded-[12px] pt-3 outline outline-1 outline-offset-[-1px] outline-[#F1F1F4]"
        >
          <div className="B3_Sb_14 mb-[1px] items-center text-gray1-0">
            문의하기
          </div>
          <img src={data.inquiryButton.publicURL} alt="문의하기" />
        </a>
      </div>
    </Container>
  );
}

export default SideNavigation;

const Container = tw.aside`
  w-[280px]
  flex
  flex-col
  gap-6
  sticky
  top-[50px]
  h-fit
`;

const NavigationContainer = tw.div`
  flex
  flex-col
  gap-6
  rounded-[16px]
  border-[1px]
  border-gray3-0
  bg-white-0
  p-6
`;

const NavigationList = tw.div`
  flex
  flex-col
  gap-[10px]
`;

const NavigationItem = tw(Link)<{ $active: boolean }>`
  flex
  justify-between
  items-center
  rounded-[30px]
  w-full
  px-[18px]
  py-3
  ${(props) => (props.$active ? 'B1_Sb_16' : 'B1_Lt_16')}
  ${(props) => (props.$active ? 'bg-bluegray4-0' : 'bg-white-0')}
  ${(props) => (props.$active ? 'text-[#25262C]' : 'text-[#6E7687]')}
`;

const DisabledNavigationItem = tw.div`
  flex
  justify-between
  items-center
  rounded-[30px]
  w-full
  px-[18px]
  py-3
  B1_Lt_16
  cursor-not-allowed
  text-text-basicDisabled
`;
