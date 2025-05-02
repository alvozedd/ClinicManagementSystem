import { createSlice } from '@reduxjs/toolkit';
import secureStorage from '../../utils/secureStorage';

// Get initial state from secure storage
const userInfo = secureStorage.getItem('userInfo');

const initialState = {
  userInfo: userInfo || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      secureStorage.setItem('userInfo', action.payload);
    },
    logout: (state) => {
      state.userInfo = null;
      secureStorage.clear();
      sessionStorage.clear();
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;
