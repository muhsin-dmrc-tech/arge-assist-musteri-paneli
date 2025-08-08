
import { useEffect, useState } from 'react';
import { getSocket } from '@/auth/socket';
import { useAuthContext } from '@/auth';
import { useSocketData } from '@/auth/SocketDataContext';

export const useSocketListener = () => {
    const { currentUser } = useAuthContext();
    const {
        handleBildirimGeldi,
        handleBildirimOkundu,
    } = useSocketData();

   

    useEffect(() => {
        (async () => {
            if (!currentUser) return;
            let userStatusPost = false;
            const socket = getSocket();
            const join = async () => {
                userStatusPost = true;
                socket.emit('joinRoomMp', currentUser.id);
                socket.emit('userStatusMp', { userId: currentUser.id, status: 'online'});
            };
            if (!userStatusPost) {
                await join(); // İlk bağlandığında
            }


            // Her bağlandığında tekrar join
            socket.on('connectMp', join);

            const handleVisibilityChange = () => {
                const status = document.hidden ? 'offline' : 'online';
                socket.emit('userStatusMp', { userId: currentUser.id, status});
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Eventler
            socket.on('newNotificationMp', handleBildirimGeldi);
            socket.on('BildirimOkunduMp', handleBildirimOkundu);


            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                socket.emit('userStatusMp', { userId: currentUser.id, status: 'offline' });

                socket.off('connectMp', join);
                socket.off('newNotificationMp', handleBildirimGeldi);
                socket.off('BildirimOkunduMp', handleBildirimOkundu);
            };
        })()
    }, [currentUser]);


};
