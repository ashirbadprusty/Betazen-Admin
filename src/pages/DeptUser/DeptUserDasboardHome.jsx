import React from "react";
import DeptUserDashboardLayout from "../../masterLayout/DeptUserDashboardLayout";
import NewRequestPageLayer from "../../components/DeptUserLayer/NewRequestPageLayer";
const DeptUserDasboardHome = () => {
  return (
    <>
      <DeptUserDashboardLayout>
        <NewRequestPageLayer />
      </DeptUserDashboardLayout>
    </>
  );
};

export default DeptUserDasboardHome;
