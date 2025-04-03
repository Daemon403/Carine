//jobslice.ts
// jobsSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';
import { Job, ApiError } from '../types';

interface JobsState {
  jobs: Job[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface CreateJobPayload {
  title: string;
  description: string;
  requiredSkills: string[];
  budget?: number;
  deadline: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

const initialState: JobsState = {
  jobs: [],
  status: 'idle',
  error: null
};

// Fetch Jobs
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (coords: { lng: number; lat: number }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await axios.get('/api/jobs', {
        params: { lng: coords.lng, lat: coords.lat },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data as ApiError);
      }
      return rejectWithValue({ message: 'Failed to fetch jobs' } as ApiError);
    }
  }
);

// Create Job
export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: CreateJobPayload, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await axios.post('/api/jobs', jobData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data as ApiError);
      }
      return rejectWithValue({ message: 'Failed to create job' } as ApiError);
    }
  }
);

// Place Bid (primary implementation)
export const placeBid = createAsyncThunk(
  'jobs/placeBid',
  async ({ jobId, amount }: { jobId: string; amount: number }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await axios.post(`/api/jobs/${jobId}/bids`, { amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data as ApiError);
      }
      return rejectWithValue({ message: 'Failed to place bid' } as ApiError);
    }
  }
);

// Add Bid (alias for placeBid)
export const addBid = placeBid;

// Accept Bid
export const acceptBid = createAsyncThunk(
  'jobs/acceptBid',
  async ({ jobId, bidId }: { jobId: string; bidId: string }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await axios.patch(`/api/jobs/${jobId}/bids/${bidId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data as ApiError);
      }
      return rejectWithValue({ message: 'Failed to accept bid' } as ApiError);
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.status = 'succeeded';
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as ApiError).message || 'Failed to fetch jobs';
      })

      // Create Job
      .addCase(createJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.status = 'succeeded';
        state.jobs.push(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as ApiError).message || 'Failed to create job';
      })

      // Place Bid/Add Bid (shared reducer logic)
      .addCase(placeBid.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action: PayloadAction<Job>) => {
        state.status = 'succeeded';
        const index = state.jobs.findIndex(j => j.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as ApiError).message || 'Failed to place bid';
      })

      // Accept Bid
      .addCase(acceptBid.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(acceptBid.fulfilled, (state, action: PayloadAction<Job>) => {
        state.status = 'succeeded';
        const index = state.jobs.findIndex(j => j.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(acceptBid.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as ApiError).message || 'Failed to accept bid';
      });
  }
});

// Selectors
export const selectAllJobs = (state: { jobs: JobsState }) => state.jobs.jobs;
export const selectJobsStatus = (state: { jobs: JobsState }) => state.jobs.status;

export default jobsSlice.reducer;