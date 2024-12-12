import {
  ChannelListParams,
  ChannelListResponse,
  CreateChannelParams,
  GetUserListParams,
  GetUserListResponse,
  MessageListApiParams,
  MessageListResponse,
  SendMessageParams,
} from "@/app/(system)/(service)/messages/type";
import instance from "@/utils/http";

import { APIResponse, ListResponse } from "../types";

export const channelListApi = (data: ChannelListParams) =>
  instance.get<ChannelListParams, APIResponse<ChannelListResponse[]>>(
    `api/notify/chat/channel/list`,
    {
      params: data,
    }
  );

export const messageListApi = (data: MessageListApiParams) =>
  instance.get<
    MessageListApiParams,
    APIResponse<ListResponse<MessageListResponse>>
  >(`api/notify/chat/message/list/page`, {
    params: data,
  });

export const sendMessageApi = (data: SendMessageParams) =>
  instance.post<SendMessageParams, APIResponse<boolean>>(
    `api/notify/chime/send/message`,
    data
  );

export const createChannel = (data: CreateChannelParams) =>
  instance.post<CreateChannelParams, APIResponse<ChannelListResponse[]>>(
    `api/notify/chime/create/channelAndMember`,
    data
  );

export const getWebsocketUrl = () =>
  instance.get<ChannelListParams, APIResponse<string>>(
    `api/notify/chime/getSocketUrl`
  );

export const getUserList = (data: GetUserListParams) =>
  instance.get<GetUserListParams, APIResponse<GetUserListResponse[]>>(
    `api/notify/chat/userChannelRef/user/list`,
    {
      params: data,
    }
  );

export const getAllUnreadCount = (communityId: string) =>
  instance.get<string, APIResponse<number>>(
    `api/notify/chat/message/unread/total`,
    {
      params: {
        communityId,
      },
    }
  );

export const upDateLeaveTimeApi = (channelId: string) =>
  instance.post<CreateChannelParams, APIResponse<boolean>>(
    `api/notify/chime/leaveTime/update/${channelId}`
  );
