export interface ChannelListParams {
  webSearchCondition?: string | null;
  communityId: string;
}

export interface UserListItem {
  userId: string;
  firstName: string;
  lastName: string;
  portraitFileId: string;
}
export interface ChannelListResponse {
  id: string;
  channelArn: string;
  channelName: string;
  instanceArn: string;
  content: string;
  mesCreatedAt: string;
  channelCreatedAt: string;
  unReadCount: number;
  isDeleted: boolean;
  type: 0 | 1;
  userList: UserListItem[];
}

export interface MessageListApiParams {
  channelId: string;
  lastViewTime?: string | null;
  size: number;
}

export interface MessageListResponse {
  id: string;
  channelId: string;
  content: string;
  userId: string;
  text: string;
  communityId: string;
  createdAt: string;
}

export interface SendMessageContent {
  type: string;
  content: string;
}
export interface SendMessageParams {
  channelId: string;
  content: SendMessageContent;
}

export interface CreateChannelParams {
  userIds: string[];
  communityId: string;
}

export interface GetUserListParams {
  communityId: string;
  name?: string | null;
}
export interface GetUserListResponse {
  userId: string;
  firstName: string;
  lastName: string;
  portraitFileId: string;
}
