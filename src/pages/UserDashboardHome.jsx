
// USER DASHBOARD HOME PAGE(SCAN PAGE)

import React from "react";
import UserDashboardLayout from "../masterLayout/UserDashboardLayout";
import ScanPageLayer from "../components/ScanPageLayer";

const UserDashboardHome = () => {
  return (
    <>
      <UserDashboardLayout>
        <ScanPageLayer />
      </UserDashboardLayout>
    </>
  );
};

export default UserDashboardHome;
