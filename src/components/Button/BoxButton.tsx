interface BoxButtonProps {
  children: React.ReactNode;
  width?: string | number;
  onClick?: () => void;
}

export function BoxButton({ children, width, onClick }: BoxButtonProps) {
  return (
    <button
      type="button"
      className="B1_Sb_16 xs:B3_Sb_14 sm:B3_Sb_14 inline-flex h-[52px] cursor-pointer items-center justify-center gap-1 self-stretch rounded-[16px] bg-bg-brandPrimary px-5 text-text-basicWhite xs:h-10 xs:rounded-[12px] xs:px-4 sm:h-10 sm:rounded-[12px] sm:px-4"
      style={{ width }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
