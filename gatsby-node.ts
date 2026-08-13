import { type GatsbyNode } from 'gatsby';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
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
                isRecruiting
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
                  isRecruiting
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
                isRecruiting
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
                  isRecruiting
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
  const DescriptionTemplateComponent = path.resolve(
    __dirname,
    'src/templates/DescriptionTemplate.tsx',
  );

  const teamList =
    queryAllSanityData.allSanityRecruitingPage.nodes[0]?.positions.cards.map(
      ({ department }) => department.basicInformation,
    ) ?? [];

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
    const pathName = name.toLowerCase().replaceAll(' ', '_');

    createPage({
      path: `recruiting/${pathName}`,
      component: DescriptionTemplateComponent,
      context: {
        name,
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
    type SanityDefaultContent {
      title: String
      content: [String]
    }

    type FAQItem {
      question: String
      answer: String
    }

    type SanityFAQContent {
      title: String
      FAQList: [FAQItem]
    }

    type SanityArticle {
      url: String
      title: String
      author: String
      description: String
      image: String
    }

    type SanityArticleContent {
      title: String
      article: [SanityArticle]
    }

    type SanityDepartment implements Node {
      task: SanityDefaultContent
      ideal: SanityDefaultContent
      experience: SanityDefaultContent
      growthAndDiff: SanityDefaultContent
      FAQ: SanityFAQContent
      medium: SanityArticleContent
    }
  `;
    createTypes(typeDefs);
  };
