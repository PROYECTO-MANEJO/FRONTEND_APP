import { Routes, Route } from "react-router";
import { Admin } from "../admin";

export const ModuleRouter = () => {
    return (
        <Routes>
            <Route path="/admin" element={<Admin />} />
        </Routes>
    )
}
