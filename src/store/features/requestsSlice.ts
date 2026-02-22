import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RequestState, RequestStatus } from '@/types';

const initialState: RequestState = {
  byKey: {},
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setRequestPending: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      state.byKey[key] = { status: 'pending', error: null };
    },
    setRequestSuccess: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      state.byKey[key] = { status: 'success', error: null };
    },
    setRequestError: (state, action: PayloadAction<{ key: string; error: string }>) => {
      const { key, error } = action.payload;
      state.byKey[key] = { status: 'error', error };
    },
    setRequestIdle: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      state.byKey[key] = { status: 'idle', error: null };
    },
    clearRequest: (state, action: PayloadAction<string>) => {
      delete state.byKey[action.payload];
    },
    clearAllRequests: (state) => {
      state.byKey = {};
    },
  },
});

export const {
  setRequestPending,
  setRequestSuccess,
  setRequestError,
  setRequestIdle,
  clearRequest,
  clearAllRequests,
} = requestsSlice.actions;

export const selectRequestStatus = (key: string) => (state: { requests: RequestState }): RequestStatus =>
  state.requests.byKey[key]?.status ?? 'idle';

export const selectRequestError = (key: string) => (state: { requests: RequestState }): string | null =>
  state.requests.byKey[key]?.error ?? null;

export const selectIsLoading = (key: string) => (state: { requests: RequestState }): boolean =>
  state.requests.byKey[key]?.status === 'pending';

export default requestsSlice.reducer;
