import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import DeptUserPageLayer from '../components/DeptUserPageLayer';

const DeptUserPage = () => {
  return (
    <>
      <MasterLayout>
        <DeptUserPageLayer/>
      </MasterLayout>
    </>
  );
};

export default DeptUserPage;
