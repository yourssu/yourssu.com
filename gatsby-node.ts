import { type GatsbyNode } from 'gatsby';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { readDepartmentAnalyticsMetadata } from './src/analytics/cmsMetadata';
import recruitingSchedule, {
  type RecruitingDepartmentReference,
  type RecruitingScheduleDocument,
  validateRecruitingSchedule,
} from './src/utils/recruitingSchedule';

interface QueryResult {
  allSanityDepartment: {
    edges: {
      node: RecruitingDepartmentReference;
    }[];
  };
  allSanityRecruitingPage: {
    nodes: {
      positions: {
        cards: {
          department: {
            _id: string;
            _rawBasicInformation: unknown;
            basicInformation: {
              name: string;
              isRecruiting: boolean;
            };
          };
        }[];
      };
    }[];
  };
  allSanityRecruitingSchedule: {
    nodes: RecruitingScheduleDocument[];
  };
}

const path = require('path');
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
    },
    output: {
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js',
    },
  });
};

export const createPages: GatsbyNode['createPages'] = async ({
  actions,
  graphql,
  reporter,
}) => {
  const { createPage } = actions;

  const result = await graphql<QueryResult>(`
    {
      allSanityDepartment {
        edges {
          node {
            _id
            _rawBasicInformation
            basicInformation {
              name
              isRecruiting
            }
          }
        }
      }
      allSanityRecruitingPage(
        filter: { _id: { eq: "recruitingPage" } }
        limit: 1
      ) {
        nodes {
          positions {
            cards {
              department {
                _id
                _rawBasicInformation
                basicInformation {
                  name
                  isRecruiting
                }
              }
            }
          }
        }
      }
      allSanityRecruitingSchedule(filter: { isActive: { eq: true } }) {
        nodes {
          _id
          title
          isActive
          withAssignment {
            departments {
              _id
              basicInformation {
                name
              }
            }
            formSchedule {
              start
              end
            }
            procedure {
              step
              schedule
            }
            departmentOverrides {
              department {
                _id
                basicInformation {
                  name
                }
              }
              formSchedule {
                start
                end
              }
              procedure {
                step
                schedule
              }
            }
          }
          withoutAssignment {
            departments {
              _id
              basicInformation {
                name
              }
            }
            formSchedule {
              start
              end
            }
            procedure {
              step
              schedule
            }
            departmentOverrides {
              department {
                _id
                basicInformation {
                  name
                }
              }
              formSchedule {
                start
                end
              }
              procedure {
                step
                schedule
              }
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild(`Error while running query`);
    return;
  }

  const queryAllSanityData = result.data;
  if (!queryAllSanityData) {
    reporter.panicOnBuild(`Sanity query returned no data`);
    return;
  }

  const schedules = queryAllSanityData.allSanityRecruitingSchedule.nodes;
  if (schedules.length !== 1) {
    reporter.panicOnBuild(
      `Expected exactly one active recruiting schedule, found ${schedules.length}`,
    );
    return;
  }

  const schedule = schedules[0];
  const knownDepartmentIds = new Set(
    queryAllSanityData.allSanityDepartment.edges
      .map(({ node }) => node._id)
      .filter((id): id is string => Boolean(id)),
  );
  validateRecruitingSchedule(schedule, knownDepartmentIds);
  const recruitmentCycleId = schedule._id;
  if (!recruitmentCycleId) {
    reporter.panicOnBuild('Active recruiting schedule is missing its ID');
    return;
  }
  const DescriptionTemplateComponent = path.resolve(
    __dirname,
    'src/templates/DescriptionTemplate.tsx',
  );

  const teamList =
    queryAllSanityData.allSanityRecruitingPage.nodes[0]?.positions.cards.map(
      ({ department }, index) => {
        const basicInformation = department.basicInformation;
        const metadata = readDepartmentAnalyticsMetadata(
          department._rawBasicInformation,
          `recruitingPage.positions.cards[${index}].department.basicInformation`,
        );
        return { ...basicInformation, slug: metadata.slug };
      },
    ) ?? [];

  const createdSlugs = new Set<string>();

  const generateDescriptionPage = (
    department: RecruitingDepartmentReference,
  ) => {
    const name = department.basicInformation?.name;
    if (!name) {
      reporter.panicOnBuild('Recruiting department is missing its name');
      return;
    }

    const recruiting = recruitingSchedule(
      schedule,
      department,
      knownDepartmentIds,
    );
    const metadata = readDepartmentAnalyticsMetadata(
      department._rawBasicInformation,
      `department.${department._id ?? '<missing-id>'}.basicInformation`,
    );
    if (createdSlugs.has(metadata.slug)) {
      reporter.panicOnBuild(
        `Recruiting department URL slug is duplicated: ${metadata.slug}`,
      );
      return;
    }
    createdSlugs.add(metadata.slug);

    createPage({
      path: `/recruiting/${metadata.slug}`,
      component: DescriptionTemplateComponent,
      context: {
        departmentId: department._id,
        jdTeamName: metadata.jdTeamName,
        name,
        recruitmentCycleId,
        teamList,
        formSchedule: recruiting.formSchedule,
        procedure: recruiting.procedure,
      },
    });
  };

  queryAllSanityData.allSanityDepartment.edges.forEach(({ node }) => {
    if (!node.basicInformation?.isRecruiting) return;
    generateDescriptionPage(node);
  });
};

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  ({ actions }) => {
    const { createTypes } = actions;

    const typeDefs = `
    type FAQItem {
      _key: String
      question: String
      answer: String
    }

    type SanityArticle {
      _key: String
      url: String
      title: String
      author: String
      description: String
      image: String
    }

    type SanityDepartmentSection {
      _key: String
      kind: String
      title: String
      description: String
      quoteText: String
      faqList: [FAQItem]
      roadToProList: [SanityRoadToPro]
      articles: [SanityArticle]
    }

    type SanityDepartment implements Node {
      sections: [SanityDepartmentSection]
      _rawSections: JSON
    }
  `;
    createTypes(typeDefs);
  };
