import { graphql, Link } from 'gatsby';
import { useBreakpoint } from 'gatsby-plugin-breakpoints';
import { useEffect, useState } from 'react';

import ApplyButton from '@/components/Button/ApplyButton';
import Layout from '@/components/Layout';
import DepartmentSeo from '@/components/Seo/DepartmentSeo';
import ApplyProcedure from '@/containers/description/ApplyProcedure';
import InaWord from '@/containers/description/InaWord';
import InformationCard from '@/containers/description/Information/InformationCard';
import Medium from '@/containers/description/Medium';
import RoadToPro from '@/containers/description/RoadToPro';
import SideNavigation from '@/containers/description/SideNavigation';
import TeamFAQ from '@/containers/description/TeamFAQ';
import TeamHeader from '@/containers/description/TeamHeader';
import {
  BasicInformation,
  DefaultContentInformation,
  FAQInformation,
  InaWordInformation,
  MediumInformation,
  RoadToProInformation,
  SkillContentInformation,
} from '@/types/recruiting.type';
import isTodayInRange from '@/utils/isTodayInRange';

const KAKAO_LINK = 'http://pf.kakao.com/_AxfrxeT';

interface SanityDepartmentData {
  allSanityDepartment: {
    edges: {
      node: {
        basicInformation: BasicInformation;
        task: DefaultContentInformation;
        ideal: DefaultContentInformation;
        experience: DefaultContentInformation;
        skill: SkillContentInformation;
        roadToProVideo: RoadToProInformation;
        growthAndDiff: DefaultContentInformation;
        inaWord: InaWordInformation;
        medium: MediumInformation;
        FAQ: FAQInformation;
      };
    }[];
  };
}

interface DescriptionTemplateProps {
  data: SanityDepartmentData;
  pageContext: {
    name: string;
    teamList: { name: string; isRecruiting: boolean }[];
    formSchedule: { start: Date | null; end: Date | null } | null;
    procedure:
      | {
          step: string;
          schedule: string;
        }[]
      | null;
  };
}

function DescriptionTemplate({
  data: {
    allSanityDepartment: { edges },
  },
  pageContext: { name, teamList, formSchedule, procedure },
}: DescriptionTemplateProps) {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const breakpoints = useBreakpoint();

  useEffect(() => {
    if (typeof window !== 'undefined' && formSchedule) {
      setIsApplicationOpen(isTodayInRange(formSchedule));
    }
  }, [formSchedule]);

  return (
    <Layout isMainPage={true}>
      <TeamHeader
        name={name}
        basicInformation={edges[0].node.basicInformation}
      />
      <div className="flex items-start justify-center gap-5 self-stretch bg-bg-basicDefault pb-20 pl-28 pr-28 pt-5 xs:px-0 sm:px-0">
        <div className="flex flex-1 items-start gap-5">
          <div className="flex flex-1 flex-col items-start justify-center gap-5">
            <InformationCard data={edges[0].node.task} />
            <InformationCard data={edges[0].node.growthAndDiff} />
            <InformationCard data={edges[0].node.ideal} />
            <InformationCard
              data={edges[0].node.experience}
              description="아래 내용에 모두 해당하지 않아도 충분히 지원 가능해요"
            />
            {/* 현재 skill 피그마에 notice 영역도 있으나 26-1 리크루팅에서는 notice 문구를 사용하지 않고 content만 사용
            따라서 data.content 내용을 보여주는 InformationCard 컴포넌트를 사용 */}
            <InformationCard data={edges[0].node.skill} />
            <ApplyProcedure applyProcedure={procedure} />
            <InaWord inaWord={edges[0].node.inaWord} />
            <TeamFAQ data={edges[0].node.FAQ} />
            <RoadToPro roadToPro={edges[0].node.roadToProVideo} />
            <Medium medium={edges[0].node.medium} />
          </div>
          {/* 데스크탑용 사이드바: 모바일에서는 아예 사라짐 */}
          <div className="sticky top-[80px] flex h-fit w-72 flex-col items-start gap-5 xs:hidden sm:hidden md:hidden">
            {!breakpoints.md && (
              <SideNavigation
                currentTeam={{
                  name,
                  isApplicationOpen,
                  applyLink: edges[0].node.basicInformation.apply_link,
                }}
                teamList={teamList}
              />
            )}
          </div>
        </div>
      </div>
      {/* 모바일 전용 하단 지원하기 버튼(고정 바) */}
      {breakpoints.md && (
        <div className="sticky bottom-0 z-50 flex w-full flex-col gap-3 bg-gradient-to-t from-white-0 from-80% to-transparent p-5">
          <ApplyButton
            link={edges[0].node.basicInformation.apply_link}
            isApplicationOpen={isApplicationOpen}
          />
          <div className="body8 flex flex-row-reverse gap-2 text-gray1-0">
            <Link
              to="/recruiting/#faq"
              className="flex w-fit flex-col items-center"
            >
              <div className="mb-[1px] items-center">FAQ 보러가기</div>
            </Link>
            |
            <a
              href={KAKAO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit flex-col items-center"
            >
              <div className="mb-[1px] items-center">문의하기</div>
            </a>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default DescriptionTemplate;

export function Head({
  data: { allSanityDepartment },
}: {
  data: SanityDepartmentData;
}) {
  const data = allSanityDepartment.edges[0].node.basicInformation;

  return (
    <DepartmentSeo
      title={`${data.short_introduction.replace(/\\n/g, '')} ${data.name}`}
      description={data.long_introduction}
      image={data.icon.asset.gatsbyImageData}
    />
  );
}

export const querySanityDataByName = graphql`
  query querySanityDataByName($name: String) {
    allSanityDepartment(filter: { basicInformation: { name: { eq: $name } } }) {
      edges {
        node {
          basicInformation {
            name
            short_introduction
            long_introduction
            apply_link
            icon {
              asset {
                gatsbyImageData(placeholder: BLURRED)
              }
            }
          }
          task {
            title
            content
          }
          growthAndDiff {
            title
            content
          }
          ideal {
            title
            content
          }
          experience {
            title
            content
          }
          skill {
            title
            content
            notice
          }
          inaWord {
            title
            word
          }
          FAQ {
            title
            FAQList {
              question
              answer
            }
          }
          medium {
            title
            article {
              url
              title
              author
              description
              image
            }
          }
          roadToProVideo {
            title
            roadToPro_list {
              video_thumbnail {
                asset {
                  gatsbyImageData(placeholder: BLURRED)
                }
              }
              presenter {
                presenter_nickname
                presenter_name
              }
              video_link
            }
          }
        }
      }
    }
  }
`;
