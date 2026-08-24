import type { DateTimeInputProps } from 'sanity';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Seoul',
});

export default function LastUpdatedDisplay({
  schemaType,
  value,
}: DateTimeInputProps) {
  return (
    <div>
      <strong>{schemaType.title}</strong>
      {schemaType.description && <p>{schemaType.description}</p>}
      <output aria-live="polite">
        {value ? (
          <time dateTime={value}>{dateFormatter.format(new Date(value))}</time>
        ) : (
          '아직 사이트 반영 요청이 없습니다.'
        )}
      </output>
    </div>
  );
}
