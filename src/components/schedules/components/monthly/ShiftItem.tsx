interface ShiftItemProps {}

const ShiftItem = (props: ShiftItemProps) => {
  return (
    <div className="border-[1px] border-[#E7EDF1] w-full mt-[4px] flex flex-col justify-center items-center p-[5px_0] hover:border-primary transition-colors duration-300 rounded-[4px] h-[73px]">
      <div className="text-[#A533E5] font-[700]">CNA</div>
      <div className="text-[#324664]">4.5 HPPD</div>
    </div>
  );
};

export default ShiftItem;
