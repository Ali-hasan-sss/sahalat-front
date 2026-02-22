import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { AuthState, User } from '@/types';
import { endpoints } from '@/lib/endpoints';
import { API_PREFIX } from '@/lib/config';

const USER_KEY = 'sahalat_user';

function persistAuth(accessToken: string | null, refreshToken: string | null, user: User | null = null) {
  if (typeof window === 'undefined') return;
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  else localStorage.removeItem('accessToken');
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  else localStorage.removeItem('refreshToken');
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export const login = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(API_PREFIX + endpoints.auth.login(), payload);
    const { user, accessToken, refreshToken } = data.data;
    persistAuth(accessToken, refreshToken, user);
    return { user, accessToken, refreshToken };
  } catch (err: unknown) {
    const ax = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(ax?.response?.data?.message ?? 'فشل تسجيل الدخول');
  }
});

export const register = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  { email: string; password: string; firstName: string; lastName: string; phone: string; country: string },
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(API_PREFIX + endpoints.auth.register(), payload);
    const { user, accessToken, refreshToken } = data.data;
    persistAuth(accessToken, refreshToken, user);
    return { user, accessToken, refreshToken };
  } catch (err: unknown) {
    const ax = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(ax?.response?.data?.message ?? 'فشل التسجيل');
  }
});

export const completeProfile = createAsyncThunk<
  User,
  { firstName: string; lastName: string; phone: string; country: string; password?: string },
  { rejectValue: string }
>('auth/completeProfile', async (payload, { getState, rejectWithValue }) => {
  const state = getState() as { auth: AuthState };
  const token = state.auth.accessToken;
  if (!token) return rejectWithValue('يجب تسجيل الدخول');
  try {
    const { data } = await axios.post(API_PREFIX + endpoints.auth.completeProfile(), payload, {
      headers: { Authorization: 'Bearer ' + token },
    });
    const user = data.data.user;
    if (state.auth.user) persistAuth(token, state.auth.refreshToken, user);
    return user;
  } catch (err: unknown) {
    const ax = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(ax?.response?.data?.message ?? 'فشل تحديث الملف');
  }
});

export const fetchMe = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchMe',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;
    if (!token) return rejectWithValue('لا يوجد token');
    try {
      const { data } = await axios.get(API_PREFIX + endpoints.auth.me(), {
        headers: { Authorization: 'Bearer ' + token },
      });
      return data.data;
    } catch {
      return rejectWithValue('فشل جلب البيانات');
    }
  }
);

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string } | null>
    ) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        persistAuth(action.payload.accessToken, action.payload.refreshToken, action.payload.user);
      } else {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        persistAuth(null, null, null);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      persistAuth(null, null, null);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? null;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        if (state.accessToken && state.refreshToken) persistAuth(state.accessToken, state.refreshToken, action.payload);
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        if (state.accessToken && state.refreshToken)
          persistAuth(state.accessToken, state.refreshToken, action.payload);
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        persistAuth(null, null, null);
      });
  },
});

export const { setAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
