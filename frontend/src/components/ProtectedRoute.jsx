import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");



  if (!token || !user) {
    return (
      <Navigate
        to="/send-otp"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }



  return children || <Outlet />;
}

export default ProtectedRoute;