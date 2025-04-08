import React from "react";
import ViewProfileLayer from "../components/ViewProfileLayer";
import MasterLayout from "../masterLayout/MasterLayout";

const ViewProfilePage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        {/* <Breadcrumb title="View Profile" /> */}

        {/* ViewProfileLayer */}
        <ViewProfileLayer />
      </MasterLayout>
    </>
  );
};

export default ViewProfilePage;
