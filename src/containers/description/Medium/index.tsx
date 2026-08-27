import type { JdTeamName } from '@/analytics/contracts';
import { trackJdExternalContentCardClick } from '@/analytics/events';
import { MediumInformation } from '@/types/recruiting.type';

interface MediumProps {
  medium: MediumInformation;
  teamName: JdTeamName;
}

function Medium({ medium, teamName }: MediumProps) {
  // 데이터가 없거나 글 목록이 비어있으면 미디엄 섹션을 보여주지 않음
  if (!medium || !medium.article || medium.article.length === 0) return null;

  return (
    <section className="flex flex-col items-start gap-6 self-stretch rounded-[12px] border border-line-basicLight p-6 xs:p-5 sm:p-5">
      <p className="T3_Sb_20 sm:T2_Sb_18 xs:T2_Sb_18 text-text-basicPrimary">
        {medium.title}
      </p>
      {medium.article.map((item) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          key={item.title}
          onClick={() =>
            trackJdExternalContentCardClick({
              content_type: 'medium',
              page_type: 'jd',
              team_name: teamName,
            })
          }
          className="flex items-center gap-5 self-stretch xs:flex-col xs:items-start sm:flex-col sm:items-start"
        >
          <img
            className="h-[120px] w-[213px] flex-shrink-0 rounded-[12px] object-cover"
            src={item.image}
            alt={item.title}
          />
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-col items-start gap-[0.13rem] self-stretch">
              <div className="B1_Sb_16 text-text-basicPrimary">
                {item.title}
              </div>
              <div className="B1_Rg_16 text-text-basicPrimary">
                {item.author}
              </div>
            </div>
            <div className="B2_Rg_15 sm:B3_Rg_14 xs:B3_Rg_14 line-clamp-2 overflow-hidden text-ellipsis text-text-basicSecondary">
              {item.description}
            </div>
          </div>
        </a>
      ))}
    </section>
  );
}

export default Medium;
