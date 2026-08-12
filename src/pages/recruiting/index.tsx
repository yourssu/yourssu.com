import { graphql } from 'gatsby';

import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import ApplyProcess from '@/containers/select/ApplyProcedure/new';
import RecruitBanner from '@/containers/select/Banner/new';
import FAQ from '@/containers/select/FAQ';
import Ideal from '@/containers/select/Ideal/new';
import Supporting from '@/containers/select/Supporting/new';

function Recruiting() {
  return (
    <Layout isMainPage={false}>
      <div className="flex w-full flex-col items-center justify-center pb-[50px] pt-[75px] xs:pt-[51px] sm:pt-[51px]">
        <RecruitBanner />
        <Supporting />
        <Ideal />
        <ApplyProcess />
        <FAQ />
      </div>
    </Layout>
  );
}

export default Recruiting;

export const query = graphql`
  query PageQuery {
    site {
      siteMetadata {
        siteUrl
      }
    }
  }
`;

export function Head() {
  return <Seo />;
}
