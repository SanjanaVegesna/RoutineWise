import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-toastify";

const RequireAuth = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            userId: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
        } else {
          // Optional: Update last login each time
          await setDoc(
            userRef,
  
            { lastLogin: serverTimestamp() },
            { merge: true }
          );
        }
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
