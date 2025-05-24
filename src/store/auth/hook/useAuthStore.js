import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { login, logout } from "../slice";
import { api } from "../../../api";

export const useAuthStore = () => {

    const {isLoading, status, user, errorMessage} = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const startLogin = async (data) => {
        try {
            const resp = await api.post("/auth/login", data);
            sessionStorage.setItem("token", resp.data.token);
            dispatch(login({ ...resp.data}));
            navigate("/");
        } catch ({response}) {
            const {data} = response;
            dispatch(logout({errorMessage: data.msg}));
        }
    }

    const startCheckToken = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return dispatch(logout({errorMessage: "No token found"}));
        try {
            const resp = await api.get("/auth/check-token");
            dispatch(login({...resp.data}));
        } catch (error) {
            dispatch(logout({errorMessage: error.response.data.msg}));
        }
    }

    const startLogout = () => {
        sessionStorage.removeItem("token");
        dispatch(logout({}));
        navigate("/login");
    }

    return {
        isLoading,
        status,
        user,
        errorMessage,
        startLogin,
        startCheckToken,
        startLogout,
    }
}