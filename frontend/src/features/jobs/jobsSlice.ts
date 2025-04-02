import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';

interface Bid {
  id: string;
  artisanId: string;
  amount: number;
  accepted: boolean;
  createdAt: string;
}

interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'completed';
  bids: Bid[];
  createdAt: string;
}

interface JobsState {
  jobs: Job[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  status: 'idle',
  error: null
};

// Action to place a bid
export const placeBid = createAsyncThunk(
  'jobs/placeBid',
  async ({ jobId, amount }: { jobId: string; amount: number }, { getState }) => {
    const token = (getState() as RootState).auth.token;
    const response = await axios.post(`/api/jobs/${jobId}/bids`, { amount }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

// Action to accept a bid
export const acceptBid = createAsyncThunk(
  'jobs/acceptBid',
  async ({ jobId, bidId }: { jobId: string; bidId: string }, { getState }) => {
    const token = (getState() as RootState).auth.token;
    const response = await axios.patch(`/api/jobs/${jobId}/bids/${bidId}/accept`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Place Bid cases
      .addCase(placeBid.pending, (state) => {
        state.status = 'loading';
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
        state.error = action.error.message || 'Failed to place bid';
      })
      
      // Accept Bid cases
      .addCase(acceptBid.pending, (state) => {
        state.status = 'loading';
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
        state.error = action.error.message || 'Failed to accept bid';
      });
  }
});

export default jobsSlice.reducer;