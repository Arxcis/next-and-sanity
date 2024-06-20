import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import { dashboardTool } from '@sanity/dashboard'
import { tasksWidget } from './widgets/tasksWidget'

export default defineConfig({
  name: 'default',
  title: 'Next-and-sanity',

  projectId: 'jgalqrm5',
  dataset: 'production',

  plugins: [structureTool(), dashboardTool({
    widgets: [
      tasksWidget({ 
        title: "Open tasks", 
        limit: 50,
        sort: "_createdAt",
        filter: { status: ["open"]}
      }),
      tasksWidget({ 
        title: "Closed tasks", 
        limit: 50, 
        sort: "_updatedAt",
        filter: { status: ["closed"]}
      })
    ]}),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
