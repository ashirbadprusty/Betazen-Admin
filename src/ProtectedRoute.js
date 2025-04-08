import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, role }) => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");
    const deptUserToken = localStorage.getItem("deptUserToken");

    if (role === "admin" && adminToken) {
        return element;
    }

    if (role === "security" && userToken) {
        return element;
    }

    if(role === "Dept_User" && deptUserToken){
        return element;
    }
    // Redirect to login if not authorized
    return <Navigate to="/sign-in" />;
};

export default ProtectedRoute;
