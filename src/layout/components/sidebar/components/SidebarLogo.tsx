import Logo from "~/logo.svg";
import LogoPure from "~/logo-pure.svg";

interface SidebarLogoProps {
  isCollapse: boolean;
}

const SidebarLogo = (props: SidebarLogoProps) => {
  const { isCollapse } = props;
  return (
    <div className="h-[67px] bg-primary overflow-hidden flex justify-center items-center">
      {isCollapse ? (
        <LogoPure width="65px" height="40px" />
      ) : (
        <Logo width="95px" height="50px" />
      )}
    </div>
  );
};

export default SidebarLogo;
