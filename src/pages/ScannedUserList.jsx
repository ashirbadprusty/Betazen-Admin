import React from "react";
import ScannedUserListLayer from "../components/ScannedUserListLayer";
import UserDashboardLayout from "../masterLayout/UserDashboardLayout";

 const ScannedUserList = () => {
  return (
    <>
      <UserDashboardLayout>
        <ScannedUserListLayer />
      </UserDashboardLayout>
    </>
  );
};
export default ScannedUserList;