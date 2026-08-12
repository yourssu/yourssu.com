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
  data: { allSanityRecruitingPage: { nodes: RecruitingPageData[] } };
}

function Recruiting({ data }: RecruitingProps) {
  const page = data.allSanityRecruitingPage.nodes[0];

  if (!page) throw new Error('Sanity에 recruitingPage 문서가 없습니다.');

  return (
    <Layout isMainPage={false}>
      <div className="flex w-full flex-col items-center justify-center pb-[50px] pt-[75px] xs:pt-[51px] sm:pt-[51px]">
        <RecruitBanner data={page.banner} />
        <Supporting data={page.positions} />
        <Ideal data={page.ideal} />
        <ApplyProcess data={page.journey} />
        <FAQ data={page.faq} />
      </div>
    </Layout>
  );
}

export default Recruiting;

export const query = graphql`
  query RecruitingPageQuery {
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
