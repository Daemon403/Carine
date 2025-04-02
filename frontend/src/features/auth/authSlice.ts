import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';

interface AuthState {
  user: null | { id: string; email: string; role: string };
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null
};

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: { email: string; password: string; role: string }) => {
    const response = await axios.post('/api/auth/register', credentials);
    return response.data;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      });
  }
});

export const { logout } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;