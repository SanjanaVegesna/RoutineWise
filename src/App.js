import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Login/Signup";
import ForgotPassword from "./components/Login/ForgotPassword";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from "./components/Layout/Dashboard";
import AppLayout from "./components/Layout/AppLayout";
import MakePlan from "./components/Layout/PlanTask";
import Profile from "./components/profile/Profile";
import RequireAuth from "./components/Login/RequireAuth";

function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="*" element={<Login />} />
                {/* Protected Routes with shared Navbar */}
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                    <Route path="/make-plan" element={<RequireAuth><MakePlan /></RequireAuth>} />
                    <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                </Route>
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />

        </>
    );
}

export default App;
