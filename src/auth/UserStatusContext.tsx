import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSocket } from './socket';

interface UserStatus {
  userId: number;
  isActive: boolean;
  lastSeen?: Date;
}

interface UserStatusContextType {
  userStatuses: Map<number, UserStatus>;
  /* getUserStatus: (userId: number) => UserStatus | undefined;
  getUsersStatus: (userIds: number[]) => UserStatus[]; */
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export const UserStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [userStatuses, setUserStatuses] = useState<Map<number, UserStatus>>(new Map());
  const emittedUserIds = useRef<Set<number>>(new Set());
  
  const socket = getSocket();

  useEffect(() => {
    socket.on('userStatus', (data: { userId: number; status: string; timestamp: string }) => {
      setUserStatuses(prev => {
        const mergedIds = new Set([...prev.keys(), ...emittedUserIds.current]);

        if (!mergedIds.has(data.userId)) return prev; // bizi ilgilendirmiyor

        const newMap = new Map(prev);
        const existing = newMap.get(data.userId);
        const isOnline = data.status === 'online';
        const lastSeen = isOnline ? undefined : new Date(data.timestamp);

       
        // Eğer durum ve lastSeen zaten aynıysa güncelleme yapma
        if (
          existing &&
          existing.isActive === isOnline &&
          (isOnline || (existing.lastSeen?.getTime() === lastSeen?.getTime()))
        ) {
          return prev;
        }
        newMap.set(data.userId, {
          userId: data.userId,
          isActive: isOnline,
          lastSeen,
        });

        return newMap;
      });
    });

    return () => {
      socket.off('userStatus');
    };
  }, []);



 /*  const getUserStatus = (userId: number): UserStatus => {
    const status = userStatuses.get(userId);

    if (!status && !emittedUserIds.current.has(userId)) {
      emittedUserIds.current.add(userId);
      socket.emit('userStatusFind', { userId });
    }

    return (
      status || {
        userId,
        isActive: false,
        lastSeen: undefined,
      }
    );
  }; */

/*   const getUsersStatus = (userIds: number[]): UserStatus[] => {
    return userIds.map(userId => {
      const status = userStatuses.get(userId);

      if (!status && !emittedUserIds.current.has(userId)) {
        emittedUserIds.current.add(userId);
        socket.emit('userStatusFind', { userId });
      }

      return (
        status || {
          userId,
          isActive: false,
          lastSeen: undefined,
        }
      );
    });
  }; */


  return (
    <UserStatusContext.Provider value={{ userStatuses }}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatus = () => {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
};