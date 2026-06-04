export interface FamilyMember {
  id: number;
  userId?: number | null;
  name?: string | null;
  role?: string | null;
  photo?: string | null;
  bio?: string | null;
  entryNumber?: string | null;
  points: number;
  isStaff: boolean;
  username?: string | null;
  userRealName?: string | null;
}
