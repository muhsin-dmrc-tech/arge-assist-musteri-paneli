import { SohbetData } from "@/auth/types";

interface UserStatus {
  userId: number;
  isActive: boolean;
  lastSeen?: Date;
}

type GetUserStatus = (userId: number) => UserStatus | undefined;
type GetUsersStatus = (userIds: number[]) => UserStatus[];

interface Props {
  Sohbet: SohbetData;
  currentUserID: number;
  getUsersStatus: GetUsersStatus;
  getUserStatus: GetUserStatus;
}

const renderUserStatus = ({ Sohbet, currentUserID, getUsersStatus, getUserStatus }: Props) => {
  if (Sohbet.SohbetTipi === 'birebir' || (Sohbet.Kullanicilar && Sohbet.Kullanicilar.length === 2)) {
    const otherUserId = Sohbet.Kullanicilar?.find(
      k => k.Kullanici.id !== currentUserID
    )?.Kullanici.id;
    if (otherUserId) {
      const status = getUserStatus(otherUserId);
      return status?.isActive ? (
        <span className="size-[9px] badge badge-circle badge-success absolute top-2 -end-1 transform -translate-y-1/2" />
      ) : null;
    }
  } else {
    const otherUsers = Sohbet.Kullanicilar?.filter(
      k => k.Kullanici.id !== currentUserID
    );
    if (!otherUsers || otherUsers.length === 0) {
      return null;
    }

    // Kullanıcı ID'lerini bir diziye dönüştürelim
    const userIds = otherUsers.map(u => u.Kullanici.id).filter(Boolean);
    if (userIds.length > 0) {
      const statuses = getUsersStatus(userIds);
      const activeCount = statuses?.filter((s: any) => s.isActive).length || 0;

      return activeCount > 0 ? (
        <div className="absolute -top-1 -right-1 bg-success rounded-full px-2 py-1 text-white text-2xs">
          +{activeCount}
        </div>
      ) : null;
    }
  }

  return null;
};

export { renderUserStatus, type Props };