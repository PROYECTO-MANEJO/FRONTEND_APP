import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        isLoading: false,
        status: "not-authenticated",
        user: null,
        errorMessage: null,

    },
    reducers: {

        onChecking: (state) => {
            state.isLoading = true;
        },
        login: (state, {payload}) => {
            state.status = "authenticated";
            state.user = payload;
        },
        logout: (state, {payload}) => {
            state.isLoading = false;
            state.status = "not-authenticated";
            state.user = null;
            state.errorMessage = payload;
        },
    },
});

export const { onChecking, login, logout } = authSlice.actions; 

