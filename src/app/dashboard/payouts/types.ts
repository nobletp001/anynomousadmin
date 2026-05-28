export interface BankDetail {
  accountName: string;
  accountNumber: string;
  bankName: string;
  whatsappNumber: string;
}

export interface PayoutClaim {
  id: number;
  username: string;
  amount: number;
  status: string;
  paidBy: string | null;
  paidByRole: string | null;
  paidAt: string | null;
  createdAt: string;
  bankDetail: BankDetail | null;
}
