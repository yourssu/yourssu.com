import { useState } from 'react';
import { type DocumentActionComponent, useSource } from 'sanity';

const BUILD_TRIGGER_ID = 'buildTrigger';

export const RequestDeployAction: DocumentActionComponent = ({ type }) => {
  const client = useSource().getClient({ apiVersion: '2025-08-15' });
  const [status, setStatus] = useState<'idle' | 'requesting' | 'error'>('idle');

  if (type !== 'buildTrigger') return null;

  let label = '사이트 반영 요청';
  if (status === 'requesting') label = '반영 요청 중…';
  if (status === 'error') label = '요청 실패 · 다시 시도';

  return {
    disabled: status === 'requesting',
    label,
    onHandle: async () => {
      setStatus('requesting');

      try {
        await client.createOrReplace({
          _id: BUILD_TRIGGER_ID,
          _type: 'buildTrigger',
          lastUpdated: new Date().toISOString(),
        });
        setStatus('idle');
      } catch {
        setStatus('error');
      }
    },
    title:
      status === 'error'
        ? '사이트 반영 요청에 실패했습니다. 다시 시도해주세요.'
        : '게시한 콘텐츠로 사이트를 다시 빌드합니다.',
    tone: status === 'error' ? 'critical' : 'positive',
  };
};
