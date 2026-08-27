import type { JdTeamName } from '@/analytics/contracts';
import { trackJdApplyClick } from '@/analytics/events';

interface ApplyButtonProps {
  link: string;
  isApplicationOpen: boolean;
  teamName: JdTeamName;
}

function ApplyButton({ link, isApplicationOpen, teamName }: ApplyButtonProps) {
  const active = Boolean(link && isApplicationOpen);
  const className = `${active ? 'active' : ''} B1_Sb_16 inline-flex h-12 items-center justify-center gap-1 self-stretch rounded-[16px] bg-[#6B5CFF] px-5 text-[#FFFFFF]`;

  return active ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackJdApplyClick({ team_name: teamName })}
    >
      지원하기
    </a>
  ) : (
    <span className={className}>지원 기간이 아닙니다</span>
  );
}

export default ApplyButton;
