import { cn } from "@/lib/utils";

export interface BaseTreeNode {
  title: string;
  value: string;
  children?: TreeNode<any>[];
  checked?: boolean | "indeterminate";
}
export type TreeNode<T extends object> = BaseTreeNode & T;
interface TreeProps {
  option: TreeNode<any>[];
  className?: string;
  leftPadding?: number;
  renderItem?: (item: TreeNode<any>) => React.ReactNode;
}
export default function Tree(prop: TreeProps) {
  const { option, className, leftPadding, renderItem } = prop;
  return (
    <div className={cn("w-full", className)}>
      {option.map((item) => {
        return (
          <div key={item.value} className="w-full">
            <div>{renderItem ? renderItem(item) : item.title}</div>
            <div
              style={{
                paddingLeft: leftPadding ? leftPadding : 20,
              }}
            >
              {item.children && (
                <Tree
                  option={item.children}
                  className={className}
                  leftPadding={leftPadding ? leftPadding : 20}
                  renderItem={renderItem}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
