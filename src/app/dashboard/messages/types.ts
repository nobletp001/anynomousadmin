export interface BankDetail {
  accountName: string;
  accountNumber: string;
  bankName: string;
  whatsappNumber: string;
}

export interface UserInfo {
  id: number;
  name: string;
  username: string;
}

export interface Sender extends UserInfo {
  bankDetails: BankDetail | null;
  referredBy: {
    referrerUsername: string;
    referrer: UserInfo | null;
  } | null;
}

export interface EnrichedMessage {
  id: number;
  content: string;
  receiverUsername: string;
  senderUsername: string | null;
  createdAt: string;
  receiver: UserInfo | null;
  sender: Sender | null;
}

export interface MessagesResponse {
  success: boolean;
  data: EnrichedMessage[];
  total: number;
  page: number;
  limit: number;
}
