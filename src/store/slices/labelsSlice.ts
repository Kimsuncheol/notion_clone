import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LabelsState {
  labels: string[];
}

const initialState: LabelsState = {
  labels: [],
};

const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {
    setLabels(state, action: PayloadAction<string[]>) {
      state.labels = action.payload;
    },
    updateLabel(state, action: PayloadAction<{ index: number; label: string }>) {
      const { index, label } = action.payload;
      if (index >= 0 && index < state.labels.length) {
        state.labels[index] = label;
      }
    },
    addLabel(state, action: PayloadAction<string>) {
      state.labels.push(action.payload);
    },
    deleteLabel(state, action: PayloadAction<number>) {
      if (action.payload >= 0 && action.payload < state.labels.length) {
        state.labels.splice(action.payload, 1);
      }
    },
  },
});

export const { setLabels, updateLabel, addLabel, deleteLabel } = labelsSlice.actions;
export default labelsSlice.reducer; 