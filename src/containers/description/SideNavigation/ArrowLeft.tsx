interface ArrowLeftProps {
  isActive: boolean;
}

export const ArrowLeft = ({ isActive }: ArrowLeftProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="13"
      viewBox="0 0 8 13"
      fill="none"
    >
      <path
        d="M6.70703 0.5L0.707031 6.59231L6.70703 12.5"
        stroke={isActive ? '#25262C' : '#6E7687'}
        strokeLinecap="round"
      />
    </svg>
  );
};
