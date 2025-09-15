import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notesAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Async thunks
export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await notesAPI.createNote(noteData);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create note';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notesAPI.getNotes(params);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notes';
      return rejectWithValue(message);
    }
  }
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notesAPI.getNoteById(id);
      return response.data.data.note;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch note';
      return rejectWithValue(message);
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, noteData }, { rejectWithValue }) => {
    try {
      const response = await notesAPI.updateNote(id, noteData);
      toast.success('Note updated successfully');
      return { id, noteData: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update note';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id, { rejectWithValue }) => {
    try {
      await notesAPI.deleteNote(id);
      toast.success('Note deleted successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete note';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  notes: [],
  selectedNote: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    search: '',
    tags: '',
  },
  isLoading: false,
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedNote: (state) => {
      state.selectedNote = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Note
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Notes
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload.notes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Note by ID
      .addCase(fetchNoteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedNote = action.payload;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Note
      .addCase(updateNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = { ...state.notes[index], ...action.payload.noteData };
        }
        if (state.selectedNote && state.selectedNote.id === action.payload.id) {
          state.selectedNote = { ...state.selectedNote, ...action.payload.noteData };
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Note
      .addCase(deleteNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = state.notes.filter(note => note.id !== action.payload);
        if (state.selectedNote && state.selectedNote.id === action.payload) {
          state.selectedNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, clearSelectedNote, setPagination } = notesSlice.actions;
export default notesSlice.reducer;