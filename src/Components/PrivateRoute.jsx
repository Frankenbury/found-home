import { Navigate, Outlet } from "react-router-dom";
import { useAuthStatus } from "../hooks/useAuthStatus";
import Spinner, { spinner } from "./Spinner";

const PrivateRoute = () => {
  // Destructure custom hook
  const { loggedIn, statusCheck } = useAuthStatus();

  if (statusCheck) {
    return <Spinner />
  }

  /* If they are logged in, render Outlet, which is the
  profile route in main App else send to sign-in page */
  return loggedIn ? <Outlet />
    :
    <Navigate to="/sign-in" />
};
export default PrivateRoute;
