export interface Referral {
  id: number;
  referrerUsername: string;
  referredUsername: string;
  createdAt: string;
}

export interface ReferralsResponse {
  success: boolean;
  data: Referral[];
  total: number;
  page: number;
  limit: number;
}
