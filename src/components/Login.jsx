import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase"; // Make sure firebase.js exports these

function Login() {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User Info:", user);
      alert(`Welcome, ${user.displayName}!`);
      // You can redirect or update UI here
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to sign in.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Login to RoutineWise</h1>
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;
