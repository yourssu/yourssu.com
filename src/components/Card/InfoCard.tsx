type DefaultDataType = {
  title: string;
  description: string;
};

interface IdealCardProps<T extends DefaultDataType> {
  SVGIconComponent: React.ReactNode;
  idealData: T;
  className?: string;
}

function InfoCard<T extends DefaultDataType>({
  SVGIconComponent,
  idealData,
  className = '',
}: IdealCardProps<T>) {
  return (
    <div
      className={`flex w-full flex-1 flex-col items-start gap-6 rounded-[12px] border border-line-basicLight p-6 xs:p-5 sm:p-5 ${className} `}
    >
      <div className="flex flex-col items-start gap-3 self-stretch">
        <div className="flex items-center gap-[0.38rem] self-stretch">
          <div className="h-6 w-6">{SVGIconComponent}</div>
          <h4 className="T3_Sb_20 text-text-basicSecondary">
            {idealData.title}
          </h4>
        </div>
        <p className="B1_Rg_16 self-stretch whitespace-pre-line text-text-basicTertiary">
          {idealData.description}
        </p>
      </div>
    </div>
  );
}

export default InfoCard;
