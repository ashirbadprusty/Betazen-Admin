import React from "react";
import DashBoardLayerOne from "../components/DashBoardLayerOne";
import MasterLayout from "../masterLayout/MasterLayout";

const HomePageOne = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        {/* <Breadcrumb title="AI" /> */}

        {/* DashBoardLayerOne */}
        <DashBoardLayerOne />
      </MasterLayout>
    </>
  );
};

export default HomePageOne;
