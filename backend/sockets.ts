import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User';
import Job from './models/Job';

export const setupSocket = (io: Server) => {
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', (socket as any).user._id);

    socket.on('joinJobRoom', (jobId: string) => {
      socket.join(jobId);
    });

    socket.on('placeBid', async ({ jobId, amount }) => {
      try {
        const user = (socket as any).user;
        if (user.role !== 'artisan') {
          throw new Error('Only artisans can place bids');
        }

        const job = await Job.findById(jobId);
        if (!job) {
          throw new Error('Job not found');
        }

        if (job.status !== 'open') {
          throw new Error('Job is no longer open for bids');
        }

        job.bids.push({
          artisanId: user._id,
          amount,
          accepted: false
        });

        await job.save();
        
        io.to(jobId).emit('newBid', { 
          bid: job.bids[job.bids.length - 1] 
        });
      } catch (error) {
        socket.emit('bidError', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};