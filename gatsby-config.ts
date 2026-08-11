import { GatsbyConfig } from 'gatsby';

const path = require('path');

require('dotenv').config({
  path: '.env',
});
// Get paths of Gatsby's required rules, which as of writing is located at:
// https://github.com/gatsbyjs/gatsby/tree/fbfe3f63dec23d279a27b54b4057dd611dce74bb/packages/
// gatsby/src/utils/eslint-rules
const gatsbyRequiredRules = path.join(
  process.cwd(),
  'node_modules',
  'gatsby',
  'dist',
  'utils',
  'eslint-rules',
);

const myCustomQueries = {
  xs: '(max-width: 390px)',
  query550: '(max-width: 550px)',
  query669: '(max-width: 669px)',
  sm: '(max-width: 720px)',
  md: '(max-width: 1080px)',
  lg: '(max-width: 1440px)',
  xl: '(max-width: 1920px)',
};

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'YOURSSU',
    description:
      '숭실대 학우들이 캠퍼스 라이프를 자유롭게 즐기는 모습을 꿈꾸다! 유어슈 동아리원들의 활동성을 원동력으로 숭실대 학우들에게 활동성을 발휘할 공간을 제공합니다.',
    siteUrl: 'https://yourssu.com',
  },
  // Since `gatsby-plugin-typescript` is automatically included in Gatsby you
  // don't need to define it here (just if you need to change the options)
  plugins: [
    {
      resolve: 'gatsby-plugin-google-tagmanager',
      options: {
        id: 'GTM-5VC2QN8Z',
        includeInDevelopment: true,
        defaultDataLayer: { platform: 'gatsby' },
      },
    },
    'gatsby-plugin-postcss',
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp', // Needed for dynamic images
    {
      resolve: 'gatsby-plugin-eslint',
      options: {
        // Gatsby required rules directory
        rulePaths: [gatsbyRequiredRules],
        // Default settings that may be omitted or customized
        stages: ['develop'],
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        exclude: ['node_modules', 'bower_components', '.cache', 'public'],
        // Any additional eslint-webpack-plugin options below
        // ...
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'yourssu',
        short_name: 'yourssu',
        start_url: '/',
        icon: 'src/assets/logo/logo.svg',
        cache_busting_mode: 'query',
      },
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        rule: {
          include: '/assets/', // See below to configure properly
        },
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        // The unique name for each instance
        name: 'logo',
        // Path to the directory
        path: `${__dirname}/src/assets/logo`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        // The unique name for each instance
        name: 'projects',
        // Path to the directory
        path: `${__dirname}/src/assets/projects`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        // The unique name for each instance
        name: 'image',
        // Path to the directory
        path: `${__dirname}/src/assets/images`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'icons',
        path: `${__dirname}/src/assets/icons`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'socials',
        path: `${__dirname}/src/assets/socials`,
      },
    },
    {
      resolve: `gatsby-source-sanity`,
      options: {
        projectId: process.env.GATSBY_APP_SANITY_PROJECT_ID,
        dataset: process.env.GATSBY_APP_SANITY_DATASET,
        // a token with read permissions is required
        // if you have a private dataset
        token: process.env.GATSBY_APP_SANITY_TOKEN,
      },
    },
    {
      resolve: 'gatsby-plugin-breakpoints',
      options: {
        queries: myCustomQueries,
      },
    },
    {
      resolve: 'gatsby-plugin-s3',
      options: {
        bucketName: 'yourssu.com',
        region: 'ap-northeast-2',
        protocol: 'https',
        hostname: 'yourssu.com',
        acl: null,
      },
    },
  ],
  jsxRuntime: 'automatic',
};

export default config;
