// src/components/AuthLayout.jsx
const AuthLayout = ({ children }) => {
    return (
      <div className="min-h-screen flex">
        {/* Left Column – Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
  
        {/* Right Column – Image or background */}
        <div className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/login-bg.png')" }}
        ></div>
      </div>
    );
  };
  
  export default AuthLayout;
  