import InfoCard from '@/components/Card/InfoCard';

import ApplyTaskChip from './ApplyTaskChip';
interface ApplyStepItemProps {
  chips: { icon: React.ReactNode; title: string }[];
  cardIcon: React.ReactNode;
  data: { title: string; description: string };
}

function ApplyStepItem({ chips, cardIcon, data }: ApplyStepItemProps) {
  return (
    // md 이하에서 순서를 뒤집기 위해 flex-col-reverse 적용
    <div className="flex flex-1 flex-col items-start gap-3 xs:flex-col-reverse sm:flex-col-reverse md:flex-col-reverse">
      <div className="flex w-full justify-center gap-3 self-stretch">
        {chips.map((chip, index) => (
          <ApplyTaskChip
            key={index}
            SVGIconComponent={chip.icon}
            chipTitle={chip.title}
          />
        ))}
      </div>

      <InfoCard
        SVGIconComponent={cardIcon}
        idealData={data}
        className="flex-1"
      />
    </div>
  );
}

export default ApplyStepItem;
