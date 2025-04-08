import React from "react";
import RegisteredUserLayer from "../components/RegisteredUserLayer";
import MasterLayout from "../masterLayout/MasterLayout";

const RegisteredUserPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        {/* <Breadcrumb title="Users List" /> */}

        {/* UsersListLayer */}
        <RegisteredUserLayer />
      </MasterLayout>
    </>
  );
};

export default RegisteredUserPage;
