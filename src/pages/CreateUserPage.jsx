import React from "react";
import CreateUserPageLayer from "../components/CreateUserPageLayer";
import MasterLayout from "../masterLayout/MasterLayout";

const CreateUserPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        
        {/* AddUserLayer */}
        <CreateUserPageLayer />
      </MasterLayout>
    </>
  );
};

export default CreateUserPage;
