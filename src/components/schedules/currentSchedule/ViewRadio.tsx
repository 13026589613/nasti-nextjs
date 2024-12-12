import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface RoleViewWeeklyProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  isShowHPPD?: boolean;
  className?: string;
  hourName?: string;
  hppdName?: string;
}

const ViewRadio = (props: RoleViewWeeklyProps) => {
  const {
    id,
    isShowHPPD,
    className,
    hourName = "Hours",
    hppdName = "HPPD",
    value = "0",
    onChange,
  } = props;

  return (
    <div>
      <RadioGroup
        className={cn("flex mt-[10px] mb-[30px]", className)}
        value={value}
        onValueChange={onChange}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Hours" id={`Hours-${id}`} />

          <Label htmlFor={`Hours-${id}`} className="text-[#919FB4]">
            {hourName}
          </Label>
        </div>

        {isShowHPPD && (
          <div className="flex items-center space-x-2 ml-[50px]">
            <RadioGroupItem value="HPPD" id={`HPPD-${id}`} />
            <Label htmlFor={`HPPD-${id}`} className="text-[#919FB4]">
              {hppdName}
            </Label>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};

export default ViewRadio;
