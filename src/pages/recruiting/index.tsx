import { graphql } from 'gatsby';

import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import ApplyProcess from '@/containers/select/ApplyProcedure/new';
import RecruitBanner from '@/containers/select/Banner/new';
import FAQ from '@/containers/select/FAQ';
import Ideal from '@/containers/select/Ideal/new';
import Supporting from '@/containers/select/Supporting/new';
import { RecruitingPageData } from '@/types/recruitingPage';

interface RecruitingProps {
  data: {
    allSanityRecruitingPage: { nodes: RecruitingPageData[] };
    allSanityRecruitingSchedule: { nodes: { _id: string }[] };
  };
}

function Recruiting({ data }: RecruitingProps) {
  const page = data.allSanityRecruitingPage.nodes[0];
  const activeSchedules = data.allSanityRecruitingSchedule.nodes;

  if (!page) throw new Error('Sanity에 recruitingPage 문서가 없습니다.');
  if (activeSchedules.length !== 1 || !activeSchedules[0]._id) {
    throw new Error('활성 리크루팅 차수를 정확히 하나 찾을 수 없습니다.');
  }
  const recruitmentCycleId = activeSchedules[0]._id;

  return (
    <Layout isMainPage={false}>
      <div
        className="flex w-full flex-col items-center justify-center pb-[50px] pt-[75px] xs:pt-[51px] sm:pt-[51px]"
        data-recruitment-cycle-id={recruitmentCycleId}
      >
        <RecruitBanner data={page.banner} />
        <Supporting
          data={page.positions}
          recruitmentCycleId={recruitmentCycleId}
        />
        <Ideal data={page.ideal} />
        <ApplyProcess data={page.journey} />
        <FAQ data={page.faq} recruitmentCycleId={recruitmentCycleId} />
      </div>
    </Layout>
  );
}

export default Recruiting;

export const query = graphql`
  query RecruitingPageQuery {
    allSanityRecruitingSchedule(filter: { isActive: { eq: true } }) {
      nodes {
        _id
      }
    }
    allSanityRecruitingPage(
      filter: { _id: { eq: "recruitingPage" } }
      limit: 1
    ) {
      nodes {
        banner {
          image {
            asset {
              url
            }
          }
          title
          description
        }
        positions {
          header {
            title
            subtitle
          }
          cards {
            _key
            department {
              basicInformation {
                name
                isRecruiting
                icon {
                  asset {
                    url
                  }
                }
              }
            }
          }
        }
        ideal {
          header {
            title
            subtitle
          }
          cards {
            _key
            title
            description
          }
        }
        journey {
          header {
            title
            subtitle
          }
          steps {
            _key
            title
            description
            tasks
          }
          notice
        }
        faq {
          header {
            title
            subtitle
          }
          items {
            _key
            question
            answer
            link {
              label
              href
            }
          }
        }
      }
    }
  }
`;

export function Head() {
  return <Seo />;
}
