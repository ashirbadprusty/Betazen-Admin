import React from "react";
import AddUserLayer from "../components/AddUserLayer";
import MasterLayout from "../masterLayout/MasterLayout";


const AddUserPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        {/* <Breadcrumb title="Add User" /> */}

        {/* AddUserLayer */}
        <AddUserLayer />


      </MasterLayout>
    </>
  );
};

export default AddUserPage;
