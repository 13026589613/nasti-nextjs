import { Dispatch, SetStateAction, useImperativeHandle } from "react";
import React from "react";

import Tree, { TreeNode } from "@/components/custom/Tree";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface PermissionProps {
  permissionList: TreeNode<expendTreeNode>[];
  setPermissionList: Dispatch<SetStateAction<TreeNode<expendTreeNode>[]>>;
}
export interface expendTreeNode {
  type: string;
  parentCode: string;
  level: string;
  disabled?: boolean;
}

export const checkIfAllChecked = (treeNode: TreeNode<expendTreeNode>[]) => {
  let flag: boolean | "indeterminate" = false;
  let length = treeNode.length;
  let checkedLength = 0;
  let indeterminateLength = 0;
  for (let index = 0; index < treeNode.length; index++) {
    const element = treeNode[index];
    if (element.children && element.children.length > 0) {
      let result: boolean | "indeterminate" = checkIfAllChecked(
        element.children
      );
      element.checked = result;
      if (result === "indeterminate") {
        indeterminateLength++;
        checkedLength++;
      } else if (result == true) {
        checkedLength++;
      }
    } else {
      if (element.checked) {
        checkedLength++;
      }
    }
  }

  if (checkedLength === length) {
    flag = true;
    indeterminateLength > 0 && (flag = "indeterminate");
  } else if (checkedLength === 0) {
    flag = false;
  } else {
    flag = "indeterminate";
  }
  return flag;
};

const Permission = React.forwardRef<any, any>((props: PermissionProps, ref) => {
  const { permissionList, setPermissionList } = props;

  const changePermissionList = (
    item: TreeNode<expendTreeNode>,
    checked: boolean | string
  ) => {
    let newList = JSON.parse(JSON.stringify(permissionList));
    findItemAndChangeValue(newList, item.value, checked as boolean);
    checkIfAllChecked(newList);
    setPermissionList(newList);
  };

  const findItemAndChangeValue = (
    list: TreeNode<expendTreeNode>[],
    value: string,
    checked: boolean
  ) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].value === value) {
        list[i].checked = checked;
        if (list[i].children) {
          setAllTreeChecked(
            list[i].children as TreeNode<expendTreeNode>[],
            checked
          );
        }
        return true;
      }
      if (
        list[i].children &&
        findItemAndChangeValue(
          list[i].children as TreeNode<expendTreeNode>[],
          value,
          checked
        )
      ) {
        return true;
      }
    }
    return false;
  };

  const setAllTreeChecked = (
    list: TreeNode<expendTreeNode>[],
    checked: boolean
  ) => {
    list.forEach((item) => {
      if (!item.disabled) {
        item.checked = checked;
      }

      if (item.children) {
        setAllTreeChecked(item.children, checked);
      }
    });
  };

  //Only two layers
  const checkIsAllChecked = (item: TreeNode<expendTreeNode>) => {
    const { children, checked } = item;
    if (children && children.length > 0) {
      const hasDisabledAndChecked = children.filter(
        (child) => child.disabled && child.checked
      );
      const hasDisabledAndNotChecked = children.filter(
        (child) => child.disabled && !child.checked
      );
      const childrenLength = children.length;
      const checkedAndNotDisabled = children.filter(
        (child) => !child.disabled && child.checked
      );

      if (checked === "indeterminate") {
        if (hasDisabledAndChecked && hasDisabledAndNotChecked) {
          const disabledLength =
            hasDisabledAndChecked.length + hasDisabledAndNotChecked.length;

          if (
            childrenLength ===
            disabledLength + checkedAndNotDisabled.length
          ) {
            return false;
          } else {
            return true;
          }
        }
      }
    }
    return !checked;
  };

  const getSelection = (treeNode: TreeNode<expendTreeNode>[]) => {
    let list: TreeNode<expendTreeNode>[] = [];
    for (let index = 0; index < treeNode.length; index++) {
      const element = treeNode[index];
      if (element.checked && element.type === "ACTION") {
        list.push(element);
      }
      if (element.children) {
        let result = getSelection(element.children);
        list = list.concat(result);
      }
    }
    return list;
  };

  useImperativeHandle(ref, () => ({
    getSelection: () => {
      return getSelection(permissionList);
    },
  }));

  return (
    <Tree
      option={permissionList}
      renderItem={(item) => {
        return (
          <div className="flex items-center gap-3 h-10">
            <Checkbox
              checked={item.checked}
              disabled={item.disabled}
              onCheckedChange={() => {
                changePermissionList(item, checkIsAllChecked(item));
              }}
              aria-label="Select row"
              style={{
                backgroundColor:
                  item.disabled && item.checked === true ? "#888c97" : "",
              }}
            />
            <span
              className={cn(
                "text-[#324664] font-[390] text-[14px] leading-10 cursor-pointer",
                item.disabled ? "text-[rgba(0,0,0,0.25)]" : ""
              )}
              onClick={() => {
                if (!item.disabled) {
                  changePermissionList(item, !item.checked);
                }
              }}
            >
              {item.title}
            </span>
          </div>
        );
      }}
    ></Tree>
  );
});
Permission.displayName = "Permission";

export default Permission;
