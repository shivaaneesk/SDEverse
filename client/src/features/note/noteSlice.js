import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNote, setNote, deleteNote, getAllMyNotes } from './noteAPI';

export const getNoteAsync = createAsyncThunk('note/getNote', async (algorithmId) => await getNote(algorithmId));
export const setNoteAsync = createAsyncThunk('note/setNote', async (noteData) => await setNote(noteData));
export const deleteNoteAsync = createAsyncThunk('note/deleteNote', async (algorithmId) => { await deleteNote(algorithmId); return algorithmId; });
export const getAllMyNotesAsync = createAsyncThunk('note/getAllMyNotes', async ({ page, limit } = {}) => await getAllMyNotes({ page, limit }));

const initialState = {
  allNotes: [],
  currentNoteContent: '',
  status: 'idle',
  saveStatus: 'idle',
  allNotesStatus: 'idle',
  currentPage: 1,
  totalPages: 1,
  totalNotes: 0,
};

export const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    setCurrentNoteContent: (state, action) => { state.currentNoteContent = action.payload; },
    clearCurrentNote: (state) => { state.currentNoteContent = ''; state.status = 'idle'; state.saveStatus = 'idle'; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNoteAsync.pending, (state) => { state.status = 'loading'; })
      .addCase(getNoteAsync.fulfilled, (state, action) => { state.status = 'succeeded'; state.currentNoteContent = action.payload.content || ''; })
      .addCase(getNoteAsync.rejected, (state) => { state.status = 'failed'; })
      .addCase(setNoteAsync.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(setNoteAsync.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.currentNoteContent = action.payload.content || '';
        const index = state.allNotes.findIndex(note => note.algorithm?._id === action.payload.algorithm);
         if (index !== -1) {
           state.allNotes[index].content = action.payload.content;
           state.allNotes[index].updatedAt = action.payload.updatedAt;
         }
      })
      .addCase(setNoteAsync.rejected, (state) => { state.saveStatus = 'failed'; })
      .addCase(deleteNoteAsync.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(deleteNoteAsync.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.allNotes = state.allNotes.filter(note => note.algorithm?._id !== action.payload);
      })
      .addCase(deleteNoteAsync.rejected, (state) => { state.saveStatus = 'failed'; })
      .addCase(getAllMyNotesAsync.pending, (state) => { state.allNotesStatus = 'loading'; })
      .addCase(getAllMyNotesAsync.fulfilled, (state, action) => {
        state.allNotesStatus = 'succeeded';
        state.allNotes = action.payload.notes || [];
        state.totalNotes = action.payload.total || 0;
        state.totalPages = action.payload.pages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(getAllMyNotesAsync.rejected, (state) => { state.allNotesStatus = 'failed'; });
  },
});

export const { setCurrentNoteContent, clearCurrentNote } = noteSlice.actions;

export const selectCurrentNoteContent = (state) => state.note.currentNoteContent;
export const selectNoteStatus = (state) => state.note.status;
export const selectNoteSaveStatus = (state) => state.note.saveStatus;
export const selectAllMyNotes = (state) => state.note.allNotes;
export const selectAllNotesStatus = (state) => state.note.allNotesStatus;
export const selectNotesCurrentPage = (state) => state.note.currentPage;
export const selectNotesTotalPages = (state) => state.note.totalPages;

export default noteSlice.reducer;