import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'presenterContent',
  type: 'object',
  fields: [
    defineField({
      name: 'presenter_nickname',
      title: '발표자 닉네임',
      type: 'string',
    }),
    defineField({
      name: 'presenter_name',
      title: '발표자 이름',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'presenter_nickname',
      subtitle: 'presenter_name',
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
