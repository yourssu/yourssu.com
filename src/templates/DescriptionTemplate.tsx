import { graphql, Link } from 'gatsby';
import { useBreakpoint } from 'gatsby-plugin-breakpoints';
import { useEffect, useState } from 'react';

import ApplyButton from '@/components/Button/ApplyButton';
import Layout from '@/components/Layout';
import DepartmentSeo from '@/components/Seo/DepartmentSeo';
import ApplyProcedure from '@/containers/description/ApplyProcedure';
import DepartmentSection from '@/containers/description/DepartmentSection';
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
  DepartmentSectionInformation,
  FAQInformation,
  InaWordInformation,
  MediumInformation,
  RoadToProInformation,
  SkillContentInformation,
} from '@/types/recruiting.type';
import isTodayInRange from '@/utils/isTodayInRange';

const KAKAO_LINK = 'http://pf.kakao.com/_AxfrxeT';

function ExternalLink({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <a
      className={className}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

interface SanityDepartmentData {
  allSanityDepartment: {
    edges: {
      node: {
        _rawSections?: DepartmentSectionInformation[];
        basicInformation: BasicInformation;
        contentSchemaVersion?: number;
        sections?: DepartmentSectionInformation[];
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
  const department = edges[0].node;
  const rawSections = new Map(
    (department._rawSections ?? []).map((section) => [section._key, section]),
  );
  const sections = department.sections?.map((section) => ({
    ...section,
    body: rawSections.get(section._key)?.body,
  }));
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const breakpoints = useBreakpoint();

  useEffect(() => {
    if (typeof window !== 'undefined' && formSchedule) {
      setIsApplicationOpen(isTodayInRange(formSchedule));
    }
  }, [formSchedule]);

  return (
    <Layout isMainPage={true}>
      <TeamHeader name={name} basicInformation={department.basicInformation} />
      <div className="flex items-start justify-center gap-5 self-stretch bg-bg-basicDefault pb-20 pl-28 pr-28 pt-5 xs:px-0 sm:px-0">
        <div className="flex flex-1 items-start gap-5">
          <div className="flex flex-1 flex-col items-start justify-center gap-5">
            {department.contentSchemaVersion === 2 ? (
              sections?.map((section) => (
                <DepartmentSection
                  key={section._key}
                  procedure={procedure}
                  section={section}
                />
              ))
            ) : (
              <>
                <InformationCard data={department.task} />
                <InformationCard data={department.growthAndDiff} />
                <InformationCard data={department.ideal} />
                <InformationCard
                  data={department.experience}
                  description="아래 내용에 모두 해당하지 않아도 충분히 지원 가능해요"
                />
                <InformationCard data={department.skill} />
                <ApplyProcedure applyProcedure={procedure} />
                <InaWord inaWord={department.inaWord} />
                <TeamFAQ data={department.FAQ} />
                <RoadToPro roadToPro={department.roadToProVideo} />
                <Medium medium={department.medium} />
              </>
            )}
          </div>
          {/* 데스크탑용 사이드바: 모바일에서는 아예 사라짐 */}
          <div className="sticky top-[80px] flex h-fit w-72 flex-col items-start gap-5 xs:hidden sm:hidden md:hidden">
            {!breakpoints.md && (
              <SideNavigation
                currentTeam={{
                  name,
                  isApplicationOpen,
                  applyLink: department.basicInformation.apply_link,
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
            link={department.basicInformation.apply_link}
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
            <ExternalLink
              className="flex w-fit flex-col items-center"
              href={KAKAO_LINK}
            >
              <div className="mb-[1px] items-center">문의하기</div>
            </ExternalLink>
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
          contentSchemaVersion
          _rawSections
          sections {
            _key
            kind
            title
            description
            quoteText
            faqList {
              question
              answer
            }
            articles {
              url
              title
              author
              description
              image
            }
            roadToProList {
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
