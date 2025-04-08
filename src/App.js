import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import ProtectedRoute from "./ProtectedRoute";

// 🏢 Pages (Import Only Once)
import ErrorPage from "./pages/ErrorPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePageOne from "./pages/HomePageOne";
import ResetPasswordPage from "./pages/ResetPasswordPageAdmin";
import ResetPasswordPageUser from "./pages/ResetPasswordPageUser";
import SignInPage from "./pages/SignInPage";

// 📌 Admin Pages
import AddUserPage from "./pages/AddUserPage";
import AllUserListPage from "./pages/AllUserListPage";
import DepartmentPage from "./pages/DepartmentPage";
import DeptUserPage from "./pages/DeptUserPage";
import RegisteredUserPage from "./pages/RegisteredUserPage";
import ScannedUserPage from "./pages/ScannedUserPage";
import ScanPageAdmin from "./pages/ScanPageAdmin";
import ScanUserListAdmin from "./pages/ScanUserListAdmin";
import SecurityPage from "./pages/SecurityPage";

// 📌 Security & Dept User Pages
import DeptUserDasboardHomePage from "./pages/DeptUser/DeptUserDasboardHome";
import UserDashboardHomePage from "./pages/UserDashboardHome";

// 📌 Profile & Utility Pages
import ScannedUserList from "./pages/ScannedUserList";
import ScanningPage from "./pages/ScanningPage";
import ScanPage from "./pages/ScanPage";

// 📌 Block Modal Component
const BlockModal = ({ alertMessage }) => {
  const [licenseKey, setLicenseKey] = useState("");

  const handleActivate = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/admin/activate-license`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ licenseKey }),
      }
    );

    const data = await response.json();
    if (data.success) {
      setLicenseKey("");
      // eslint-disable-next-line no-undef
      checkLicenseStatus();
      // window.location.reload();
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-md relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🔒 Access Blocked
        </h2>
        <p className="text-red-600 text-sm font-medium mb-6">{alertMessage}</p>

        <input
          type="text"
          placeholder="Enter License Key"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />

        <button
          onClick={handleActivate}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition shadow-lg text-black"
        >
          🔑 Activate
        </button>
      </div>
    </div>
  );
};

// 🔥 Define Routes in an Array (Easier to Modify)
const routes = [
  { path: "/", element: <HomePageOne />, role: "admin" },
  { path: "/sign-in", element: <SignInPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password/:token", element: <ResetPasswordPage /> },
  { path: "/reset-password-user/:token", element: <ResetPasswordPageUser /> },

  // Admin Routes
  { path: "/add-user", element: <AddUserPage />, role: "admin" },
  { path: "/all-users-list", element: <AllUserListPage />, role: "admin" },
  {
    path: "/scanned-users-list-admin",
    element: <ScanUserListAdmin />,
    role: "admin",
  },
  { path: "/scanned-user", element: <ScannedUserPage />, role: "admin" },
  { path: "/reg-user", element: <RegisteredUserPage />, role: "admin" },
  { path: "/scan-admin", element: <ScanPageAdmin />, role: "admin" },
  { path: "/security-user", element: <SecurityPage />, role: "admin" },
  { path: "/departments", element: <DepartmentPage />, role: "admin" },
  { path: "/dept-user", element: <DeptUserPage />, role: "admin" },

  // Security & Department User Routes
  {
    path: "/userDashboard",
    element: <UserDashboardHomePage />,
    role: "security",
  },
  {
    path: "/scanned-users-list",
    element: <ScannedUserList />,
    role: "security",
  },

  {
    path: "/deptUserDashboard",
    element: <DeptUserDasboardHomePage />,
    role: "Dept_User",
  },

  // Profile & Miscellaneous
  // { path: "/view-profile", element: <ViewProfilePage />, role: "admin" },
  { path: "/scan", element: <ScanPage /> },
  { path: "/scan-page", element: <ScanningPage /> },

  // Catch-All 404 Page
  { path: "*", element: <ErrorPage /> },
];

function App() {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const checkLicenseStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/admin/license-status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await response.json();

      if (data.isExpired) {
        setShowBlockModal(true);
        setAlertMessage(data.alertMessage);
      }
    } catch (error) {
      console.error("Error fetching license status:", error);
    }
  };

  useEffect(() => {
    checkLicenseStatus();
  }, []);
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      {showBlockModal && <BlockModal alertMessage={alertMessage} />}
      <Routes>
        {!showBlockModal &&
          routes.map(({ path, element, role }) =>
            role ? (
              <Route
                key={path}
                exact
                path={path}
                element={<ProtectedRoute element={element} role={role} />}
              />
            ) : (
              <Route key={path} exact path={path} element={element} />
            )
          )}
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
