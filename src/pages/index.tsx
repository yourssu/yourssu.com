import { graphql } from 'gatsby';

import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Banner from '@/containers/landing/Banner';
import Channel from '@/containers/landing/Channel';
import CoreValue from '@/containers/landing/CoreValue';
import Culture from '@/containers/landing/Culture/new';
import MissionVision from '@/containers/landing/MVC/new';
import Product from '@/containers/landing/Product';
import { ReviewCarousel } from '@/containers/landing/Review';
import ToRecruit from '@/containers/landing/ToRecruit';
import { MainPageData } from '@/types/mainPage';

interface HomeProps {
  data: { allSanityMainPage: { nodes: MainPageData[] } };
}

export default function Home({ data }: HomeProps) {
  const page = data.allSanityMainPage.nodes[0];

  if (!page) throw new Error('Sanity에 mainPage 문서가 없습니다.');

  return (
    <Layout isMainPage>
      <Banner data={page.hero} />
      <Product data={page.product} />
      <MissionVision data={page.missionVision} />
      <CoreValue data={page.coreValue} />
      <Culture data={page.culture} />
      <Channel data={page.channel} />
      <ReviewCarousel data={page.reviews} />
      <ToRecruit data={page.recruit} />
    </Layout>
  );
}

export const query = graphql`
  query HomePageQuery {
    allSanityMainPage(filter: { _id: { eq: "mainPage" } }, limit: 1) {
      nodes {
        _id
        hero {
          title
          images {
            asset {
              url
            }
          }
          buttonText
          buttonLink
        }
        product {
          title
          subtitle
          items {
            _key
            title
            description
            image {
              asset {
                url
              }
            }
            link
          }
        }
        missionVision {
          _key
          subtitle
          title
          desktopDescription
          mobileDescription
          image {
            asset {
              url
            }
          }
        }
        coreValue {
          title
          subtitle
          items {
            _key
            desktopTitle
            mobileTitle
            summary
            desktopDescription
            mobileDescription
            image {
              asset {
                url
              }
            }
          }
        }
        culture {
          title
          subtitle
          items {
            _key
            tag
            title
            description
          }
        }
        channel {
          title
          items {
            _key
            title
            link
            image {
              asset {
                url
              }
            }
            tags
          }
        }
        reviews {
          _key
          nickname
          part
          review
        }
        recruit {
          image {
            asset {
              url
            }
          }
          desktopTitle
          mobileTitle
          desktopButtonText
          mobileButtonText
          buttonLink
        }
      }
    }
  }
`;

export function Head() {
  return <Seo />;
}
