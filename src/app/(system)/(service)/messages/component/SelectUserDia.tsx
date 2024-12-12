"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createChannel, getUserList } from "@/api/chat";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomInput from "@/components/custom/Input";
import { Checkbox } from "@/components/ui/checkbox";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useUserInfo from "@/hooks/useUserInfo";

import { ChannelListResponse, GetUserListResponse } from "../type";
import Avatar from "./Avatar";

interface SelectUserDiaProps {
  onClose: () => void;
  open: boolean;
  onSuccess: (data: ChannelListResponse) => void;
}

const SelectUserDia = (props: SelectUserDiaProps) => {
  const { open, onClose, onSuccess } = props;

  const { userId } = useUserInfo();

  const { communityId } = useGlobalCommunityId();

  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [selectedUser, setSelectedUser] = useState<string[]>([]);

  const [userList, setUserList] = useState<GetUserListResponse[]>([]);

  const getUserListFn = async () => {
    const { data, code } = await getUserList({
      name: searchValue ? searchValue : null,
      communityId,
    });
    if (code === 200) {
      setUserList(data.filter((item) => item.userId !== userId));
    }
  };

  useEffect(() => {
    if (communityId) {
      getUserListFn();
    }
  }, [searchValue, communityId]);

  const handleSelectUser = (id: string) => {
    if (selectedUser.includes(id)) {
      setSelectedUser(selectedUser.filter((item) => item !== id));
    } else {
      setSelectedUser([...selectedUser, id]);
    }
  };

  const confirmClick = async () => {
    if (selectedUser.length === 0) {
      toast.warning("Please select at least one user.");
      return;
    }

    try {
      setLoading(true);
      const res = await createChannel({
        userIds: selectedUser,
        communityId,
      });
      if (res.code === 200) {
        onClose();
        onSuccess(res.data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog
      open={open}
      width={450}
      titleWrapperClassName="hidden"
      onClose={() => {
        onClose();
      }}
    >
      <div className="pt-5">
        <CustomInput
          className="bg-[#F3F6F6] border-[0] mb-4"
          value={searchValue}
          isClearable={true}
          onChange={(data) => {
            setSearchValue(data.target.value);
          }}
          prefix="SearchIcon"
          placeholder="Search"
        />
        <div className="w-full h-[calc(100vh-300px)] overflow-auto mb-4">
          {userList.map((item) => (
            <div
              key={item.userId}
              className="flex items-center gap-4 h-[48px] select-none"
            >
              <Checkbox
                onClick={() => {
                  handleSelectUser(item.userId);
                }}
                checked={selectedUser.includes(item.userId)}
              ></Checkbox>

              <div
                onClick={() => {
                  handleSelectUser(item.userId);
                }}
                className="flex-shrink-0 rounded-[50%] h-[36px] w-[36px] cursor-pointer overflow-hidden"
              >
                <Avatar
                  className="h-[36px] w-[36px]"
                  url={item.portraitFileId}
                  userName={item.firstName}
                  width={36}
                  height={36}
                ></Avatar>
              </div>
              <div
                onClick={() => {
                  handleSelectUser(item.userId);
                }}
                className="text-[14px] text-[#324664] font-[390] leading-10 cursor-pointer"
              >
                {item.firstName + " " + item.lastName}
              </div>
            </div>
          ))}
        </div>
        {/* Dialog Form Btn‘s */}
        <div className="flex gap-6 justify-end mt-5">
          <Button
            onClick={() => {
              onClose();
            }}
            variant="outline"
          >
            Cancel
          </Button>

          <Button onClick={confirmClick} loading={loading} type="submit">
            Confirm
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
};

export default SelectUserDia;
