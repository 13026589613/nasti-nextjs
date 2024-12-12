interface ViewRoleTagsProps {
  roleList: { name: string; color: string }[];
}

const ViewRoleTags = (props: ViewRoleTagsProps) => {
  const { roleList } = props;

  return (
    <div className="flex flex-wrap justify-end m-[15px_0] gap-4">
      {roleList.map((item, index) => (
        <div key={index} className="flex items-center">
          <div
            className="w-[34px] h-[6px] mr-[9px] rounded-[3px]"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ViewRoleTags;
