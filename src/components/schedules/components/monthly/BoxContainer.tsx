interface BoxContainerProps {
  children: React.ReactNode;
  onMouseLeave?: () => void;
  onMouseEnter?: () => void;
}

const BoxContainer = (props: BoxContainerProps) => {
  const { children, onMouseLeave, onMouseEnter } = props;
  return (
    <div
      className="flex-[1_0_14.28%] min-w-[182px] border-[1px] border-[#E7EDF1] relative min-h-[95px]"
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
};

export default BoxContainer;
