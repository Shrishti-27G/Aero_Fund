import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CatchAllRedirect = () => {
  const isAuthenticated = useSelector(
    (state) => state.adminAuth.isAuthenticated
  );

  if (isAuthenticated) {
    return <Navigate to="/stations" replace />;
  }

  return <Navigate to="/" replace />;
};

export default CatchAllRedirect;
