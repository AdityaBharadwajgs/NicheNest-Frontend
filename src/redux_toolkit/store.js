import { configureStore } from '@reduxjs/toolkit';
import signupUserReducer from './signedupUserslice';
import loggedinUserReducer from './loggedinUserslice';

const store = configureStore({
    reducer: {
        signedupUser: signupUserReducer,
        loggedinUser: loggedinUserReducer
    }
});
export default store;