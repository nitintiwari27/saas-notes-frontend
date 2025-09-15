import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Async thunks
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getPlans();
      return response.data.data.plans;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch plans';
      return rejectWithValue(message);
    }
  }
);

export const fetchMySubscription = createAsyncThunk(
  'subscription/fetchMySubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getMySubscription();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch subscription';
      return rejectWithValue(message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'subscription/createOrder',
  async ({ slug, paymentData }, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.createOrder(slug, paymentData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create order';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'subscription/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.verifyPayment(paymentData);
      toast.success(response.data.message);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Payment verification failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'subscription/fetchPaymentHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getPaymentHistory(params);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch payment history';
      return rejectWithValue(message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.cancelSubscription();
      toast.success(response.data.message);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel subscription';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  plans: [],
  currentSubscription: null,
  account: null,
  paymentHistory: [],
  paymentPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  orderData: null,
  isLoading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOrderData: (state) => {
      state.orderData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My Subscription
      .addCase(fetchMySubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMySubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload.subscription;
        state.account = action.payload.account;
      })
      .addCase(fetchMySubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload.subscription;
        state.account = action.payload.account;
        state.orderData = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentHistory = action.payload.payments;
        state.paymentPagination = action.payload.pagination;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload.subscription;
        state.account = action.payload.account;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearOrderData } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;