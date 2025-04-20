import { Navigate } from "react-router-dom";
import { auth } from "../../firebase";
import { toast } from 'react-toastify';

const RequireAuth = ({ children }) => {
  const user = auth.currentUser;

  if (!user) {
    toast.error("Session Expired!! Please Login or SignUp.");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
