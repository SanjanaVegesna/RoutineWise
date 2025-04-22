import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";

const RequireAuth = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        toast.error("Session Expired!! Please Login or SignUp.");
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-500">
        🔐 Checking your session...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;
