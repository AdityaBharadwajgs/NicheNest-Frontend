import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loggedinUser: JSON.parse(localStorage.getItem('loggedinUser')) || {}
};

const loggedinUserSlice = createSlice({
    name: "loggedinUser",
    initialState,
    reducers: {
        setloggedinUser: (state, action) => {
            state.loggedinUser = action.payload || {};
            localStorage.setItem('loggedinUser', JSON.stringify(state.loggedinUser));
        },
        logoutUser: (state) => {
            state.loggedinUser = {};
            localStorage.removeItem('loggedinUser');
        }
    }
});

export const { setloggedinUser, logoutUser } = loggedinUserSlice.actions;

export default loggedinUserSlice.reducer;