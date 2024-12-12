interface DetailLayoutProps {
  footerRender: React.ReactNode;
  children: React.ReactNode;
}
const DetailLayout = (props: DetailLayoutProps) => {
  const { footerRender, children } = props;
  return (
    <div>
      <div className="h-[calc(100vh-160px)] overflow-auto">
        <div className="px-4 pb-5">{children}</div>
      </div>
      <div className="flex justify-end w-full px-4">{footerRender}</div>
    </div>
  );
};

export default DetailLayout;
