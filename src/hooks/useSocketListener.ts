
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
                socket.emit('joinRoom', currentUser.id);
                socket.emit('userStatus', { userId: currentUser.id, status: 'online'});
            };
            if (!userStatusPost) {
                await join(); // İlk bağlandığında
            }


            // Her bağlandığında tekrar join
            socket.on('connect', join);

            const handleVisibilityChange = () => {
                const status = document.hidden ? 'offline' : 'online';
                socket.emit('userStatus', { userId: currentUser.id, status});
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Eventler
            socket.on('newNotification', handleBildirimGeldi);
            socket.on('BildirimOkundu', handleBildirimOkundu);


            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                socket.emit('userStatus', { userId: currentUser.id, status: 'offline' });

                socket.off('connect', join);
                socket.off('newNotification', handleBildirimGeldi);
                socket.off('BildirimOkundu', handleBildirimOkundu);
            };
        })()
    }, [currentUser]);


};
