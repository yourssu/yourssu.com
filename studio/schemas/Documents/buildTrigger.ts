import {MdOutlineUpdate as icon} from 'react-icons/md'
import {defineType} from 'sanity'

export default defineType({
  name: 'buildTrigger',
  title: 'Last Update',
  type: 'document',
  icon,
  fields: [
    {
      name: 'lastUpdated',
      title: '마지막 업데이트',
      description:
        '모든 데이터의 수정을 완료한 후에는 이 값을 업데이트 해주세요. 이 값이 변경되면 모든 데이터가 사이트에 반영됩니다.',
      type: 'datetime',
    },
  ],
})
