"use client";

import { useSocketContext } from '@/contexts/SocketContext';

export const useSocket = () => {
    const { socket } = useSocketContext();
    return socket;
};
