import {FaFileVideo as icon} from 'react-icons/fa'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'roadToPro',
  title: 'Road To Pro',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'video_thumbnail',
      title: '영상 썸네일',
      type: 'image',
    }),
    defineField({
      name: 'presenter',
      title: '발표자',
      type: 'array',
      of: [{type: 'presenterContent'}],
    }),
    defineField({
      name: 'video_link',
      title: '영상 링크',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      presenter: 'presenter',
      media: 'video_thumbnail',
    },
    prepare(selection) {
      const {presenter, media} = selection
      const firstPresenter =
        presenter && presenter.length > 0
          ? presenter[0]
          : {presenter_nickname: 'No presenter', presenter_name: 'No name'}

      return {
        title: firstPresenter.presenter_nickname,
        subtitle: firstPresenter.presenter_name,
        media: media,
      }
    },
  },
})
