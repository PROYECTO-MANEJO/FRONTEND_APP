import {Routes, Route, Navigate} from "react-router";
import { useAuthStore } from "../store";
import { useEffect } from "react";
import { ModuleRouter } from "../module/routes";
import { AuthRoutes } from "../auth/routes";


export const AppRouter = () => {


    const {status, startCheckToken} = useAuthStore();

    useEffect(() => {
        startCheckToken();
    }, []); 

    if (status === "checking") return <h1>Checking...</h1>;

    return (
        <Routes>
            {
                status === "authenticated" 
                ? <>
                    <Route path="/*" element={<ModuleRouter />} />
                    <Route path="/*" element={<Navigate to="/" />} />

                </>
                : <>
                    <Route path="/auth" element={<AuthRoutes />} />
                    <Route path="/*" element={<Navigate to="/auth/login" />} />
                </>
            }
        </Routes>
        
    )
}   