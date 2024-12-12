import AuthProvide from "@/components/custom/Auth";
import Button from "@/components/custom/Button";
import { cn } from "@/lib/utils";

interface ViewNoDataProps {
  className?: string;
  textList: string[];
  showBtn?: boolean;
  btnClick?: () => void;
}
const ViewNoData = (props: ViewNoDataProps) => {
  const { className, textList, showBtn = true, btnClick } = props;

  return (
    <div
      className={cn(
        "min-h-[548px] bg-[#0000000A] flex flex-col items-center",
        className
      )}
    >
      <div className="leading-[40px] text-center">
        {textList.map((text, index) => (
          <div key={index}>{text}</div>
        ))}
      </div>

      {showBtn && (
        <AuthProvide permissionName={"TEMPLATE_MANAGEMENT_ADD"}>
          <Button
            className="mt-[50px] w-[364px] h-[80px] text-[24px]"
            onClick={btnClick}
          >
            Make a Schedule Template
          </Button>
        </AuthProvide>
      )}
    </div>
  );
};

export default ViewNoData;
