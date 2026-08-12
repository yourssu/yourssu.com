import { type GatsbyNode } from 'gatsby';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import recruitingSchedule from './src/utils/recruitingSchedule';

interface QueryResult {
  allSanityDepartment: {
    edges: {
      node: {
        basicInformation: {
          name: string;
          isRecruiting: boolean;
        };
        applyProcedure: {
          scheduleWithoutAssignment: boolean;
          scheduleWithAssignment: boolean;
          individualSchedule: boolean;
          formSchedule: {
            start: Date;
            end: Date;
          };
          procedure: {
            step: string;
            schedule: string;
          }[];
        };
      };
    }[];
  };
  scheduleWithAssignment: {
    edges: {
      node: {
        title: string;
        formSchedule: {
          start: Date;
          end: Date;
        };
        procedure: {
          step: string;
          schedule: string;
        }[];
      };
    }[];
  };
  scheduleWithoutAssignment: {
    edges: {
      node: {
        title: string;
        formSchedule: {
          start: Date;
          end: Date;
        };
        procedure: {
          step: string;
          schedule: string;
        }[];
      };
    }[];
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
      allSanityDepartment(sort: { basicInformation: { key: ASC } }) {
        edges {
          node {
            basicInformation {
              name
              isRecruiting
            }
            applyProcedure {
              scheduleWithoutAssignment
              scheduleWithAssignment
              individualSchedule
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
      scheduleWithAssignment: allSanityRecruitingSchedule(
        filter: { title: { regex: "/과제 O$/" } }
      ) {
        edges {
          node {
            title
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
      scheduleWithoutAssignment: allSanityRecruitingSchedule(
        filter: { title: { regex: "/과제 X$/" } }
      ) {
        edges {
          node {
            title
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
  `);

  if (result.errors) {
    reporter.panicOnBuild(`Error while running query`);
    return;
  }

  const queryAllSanityData = result.data;

  const DescriptionTemplateComponent = path.resolve(
    __dirname,
    'src/templates/DescriptionTemplate.tsx',
  );

  const teamList = queryAllSanityData?.allSanityDepartment.edges.map(
    (edge) => edge.node.basicInformation,
  );

  const checkRecruitType = (recruitTypeData: {
    scheduleWithoutAssignment: boolean;
    scheduleWithAssignment: boolean;
    individualSchedule: boolean;
    formSchedule: {
      start: Date;
      end: Date;
    };
    procedure: {
      step: string;
      schedule: string;
    }[];
  }): {
    formSchedule: { start: Date | null; end: Date | null } | null;
    procedure: { step: string; schedule: string }[] | null;
  } => {
    const {
      scheduleWithoutAssignment,
      scheduleWithAssignment,
      individualSchedule,
      formSchedule,
      procedure,
    } = recruitTypeData;

    const recruitingType = {
      individualSchedule,
      scheduleWithAssignment,
      scheduleWithoutAssignment,
    };

    const scheduleWithAssignmentData =
      queryAllSanityData?.scheduleWithAssignment?.edges[0]?.node.formSchedule ||
      null;
    const scheduleWithoutAssignmentData =
      queryAllSanityData?.scheduleWithoutAssignment?.edges[0]?.node
        .formSchedule || null;
    const scheduleIndividualData = formSchedule || null;

    const recruitingScheduleData = recruitingSchedule({
      recruitingType,
      scheduleWithAssignmentData,
      scheduleWithoutAssignmentData,
      scheduleIndividualData,
    });

    if (!recruitingScheduleData) {
      return {
        formSchedule: null,
        procedure: null,
      };
    }

    if (recruitingScheduleData.type === 'individual') {
      return {
        formSchedule: recruitingScheduleData.formSchedule,
        procedure: procedure,
      };
    }

    if (recruitingScheduleData.type === 'withAssignment') {
      return {
        formSchedule: recruitingScheduleData.formSchedule,
        procedure:
          queryAllSanityData?.scheduleWithAssignment?.edges[0]?.node
            .procedure || [],
      };
    }

    if (recruitingScheduleData.type === 'withoutAssignment') {
      return {
        formSchedule: recruitingScheduleData.formSchedule,
        procedure:
          queryAllSanityData?.scheduleWithoutAssignment?.edges[0]?.node
            .procedure || [],
      };
    }

    return {
      formSchedule: null,
      procedure: null,
    };
  };

  const generateDescriptionPage = ({
    name,
    recruiting,
  }: {
    name: string;
    recruiting: {
      formSchedule: { start: Date | null; end: Date | null } | null;
      procedure: { step: string; schedule: string }[] | null;
    };
  }) => {
    const pathName = name.toLowerCase().replaceAll(' ', '_');

    const pageOptions = {
      path: `recruiting/${pathName}`,
      component: DescriptionTemplateComponent,
      context: {
        name,
        teamList,
        formSchedule: recruiting.formSchedule,
        procedure: recruiting.procedure,
      },
    };

    createPage(pageOptions);
  };

  queryAllSanityData?.allSanityDepartment.edges.forEach((data) => {
    if (!data.node.basicInformation.isRecruiting) return;

    generateDescriptionPage({
      name: data.node.basicInformation.name,
      recruiting: checkRecruitType(data.node.applyProcedure),
    });
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
