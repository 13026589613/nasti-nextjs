interface ContainerProps {
  children: React.ReactNode;
}

const Container = (props: ContainerProps) => {
  const { children } = props;
  return (
    <div className="border-[1px] border-[#E7EDF1] mt-[8px] flex flex-wrap">
      {children}
    </div>
  );
};

export default Container;
