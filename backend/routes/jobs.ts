import express from 'express';
import { Request, Response } from 'express';
import Job from '../models/Job';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Middleware to check if user is artisan or client
router.use(authenticate)


// Get nearby jobs
router.get('/', async (req: Request, res: Response) => {
  const { lng, lat, maxDistance = 10000 } = req.query; // Default 10km radius

  try {
    const jobs = await Job.find({
      status: 'open',
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
          },
          $maxDistance: parseFloat(maxDistance as string)
        }
      }
    }).populate('clientId', 'email profile');

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Create job
router.post('/', authorize(['client']), async (req: Request, res: Response) => {
  const { title, description, location } = req.body;
  const clientId = req.user.id;

  try {
    const job = new Job({
      clientId,
      title,
      description,
      location: {
        type: 'Point',
        coordinates: location
      },
      status: 'open'
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job' });
  }
});

// Place bid
router.post('/:id/bids', authorize(['artisan']), async (req: Request, res: Response) => {
  if (req.user.role !== 'artisan') {
    return res.status(403).json({ message: 'Only artisans can place bids' });
  }

  const { amount } = req.body;
  const jobId = req.params.id;
  const artisanId = req.user.id;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is no longer open for bids' });
    }

    job.bids.push({
      artisanId,
      amount,
      accepted: false
    });

    await job.save();
    
    // Emit socket event
    req.io.emit('newBid', { jobId, bid: job.bids[job.bids.length - 1] });
    
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error placing bid' });
  }
});

export default router;