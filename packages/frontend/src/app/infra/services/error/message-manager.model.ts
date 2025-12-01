export interface MessageChannel {
  id: string;
  name: string;
}

export interface MessageDetail {
  id: string;
  severity: MessageSeverity;
  title: string;
  message?: string;
  channelId: MessageChannel['id'];
  createdAt?: Date;
  aliveUntil?: Date;
}

export enum MessageSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum MessageRegion {
  LOCAL = 'local',
  GLOBAL = 'global',
}

export enum GlobalChannel {
  DEFAULT = 'global-default-channel',
}
