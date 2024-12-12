import Spin from "@/components/custom/Spin";

interface DetailLayoutProps {
  loading: boolean;
  footerRender: React.ReactNode;
  children: React.ReactNode;
}
const DetailLayout = (props: DetailLayoutProps) => {
  const { footerRender, loading, children } = props;
  return (
    <Spin loading={loading}>
      <div>
        <div className="h-[calc(100vh-160px)] overflow-auto">
          <div className="px-4 pb-5">{children}</div>
        </div>
        <div className="flex justify-end w-full px-4">{footerRender}</div>
      </div>
    </Spin>
  );
};

export default DetailLayout;
