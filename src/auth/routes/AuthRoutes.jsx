import { Routes, Route, Navigate } from "react-router";
import { Login } from "../pages";

export const AuthRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<Navigate to="/login" />} />
        </Routes>
    )
}
