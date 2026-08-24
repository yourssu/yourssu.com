import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
//import {googleMapsInput} from '@sanity/google-maps-input'
import { RequestDeployAction } from './actions/RequestDeployAction';
import { schemaTypes } from './schemas';
import { structure } from './structure';

export default defineConfig({
  name: 'default',
  title: 'yourssu-sanity-cms',

  projectId: 'f877vcud',
  dataset: 'production',

  plugins: [
    structureTool({ structure }),
    visionTool(),
    //googleMapsInput(),
  ],

  document: {
    actions: (actions, context) =>
      context.schemaType === 'buildTrigger' ? [RequestDeployAction] : actions,
  },

  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => schemaType !== 'buildTrigger'),
  },
});
