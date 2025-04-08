import React from "react";
import AllUserListLayer from "../components/AllUserListLayer";
import MasterLayout from "../masterLayout/MasterLayout";

const AllUserListPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        
        {/* AddUserLayer */}
        <AllUserListLayer />
      </MasterLayout>
    </>
  );
};

export default AllUserListPage;
