import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthToken } from '../features/auth/authSlice';

const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = useSelector(selectAuthToken);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); 
      //this is also a good place to clean up the socket connection
    };
  }, [token]);

  return socket;
};

export default useSocket;