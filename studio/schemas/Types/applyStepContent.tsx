import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'applyStepContent',
  title: '지원 단계',
  type: 'object',
  fields: [
    defineField({
      name: 'step',
      title: '단계',
      type: 'string',
    }),
    defineField({
      name: 'schedule',
      title: '일정',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'step',
      subtitle: 'schedule',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      const checkInformation = title && subtitle

      return {
        title: title,
        subtitle: subtitle,
        media: checkInformation ? <span style={{fontSize: '1.2rem'}}>✅</span> : <span>❌</span>,
      }
    },
  },
})
