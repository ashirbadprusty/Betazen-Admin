import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

const cardData = [
  {
    title: "New Request",
    count: 0,
    bg: "bg-cyan",
    icon: "gridicons:multiple-users",
  },
  {
    title: "Total Visitors",
    count: 0,
    bg: "bg-purple",
    icon: "fa-solid:award",
  },
  {
    title: "Today Visitors",
    count: 0,
    bg: "bg-info",
    icon: "fluent:people-20-filled",
  },
  {
    title: "Total Employee",
    count: 0,
    bg: "bg-success",
    icon: "fluent:people-20-filled",
  },
  {
    title: "Total Security",
    count: 0,
    bg: "bg-danger",
    icon: "fluent:people-20-filled",
  },
  {
    title: "Missed Out Records",
    count: 0,
    bg: "bg-warning",
    icon: "fluent:people-20-filled",
  },
];

const UnitCountOne = () => {
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [totalVisitorsCount, setTotalVisitorsCount] = useState(0);
  const [todayVisitorsCount, setTodayVisitorsCount] = useState(0);
  const [totalEmployeecount, setTotalEmployeeCount] = useState(0);
  const [totalSecurityCount, setTotalSecurityCount] = useState(0);
  const [missedRecordsCount, setMissedRecordsCount] = useState(0);

  // Function to fetch the new requests and total visitors count
  const fetchNewRequestsCount = async () => {
    try {
      const companyId= localStorage.getItem("companyId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/reqRegCount/?companyId=${companyId}`
      );
      setNewRequestsCount(response.data.data.newRequests || 0);
      setTotalVisitorsCount(response.data.data.totalVisitors || 0);
    } catch (error) {
      console.error(
        "Error fetching new requests and total visitors count:",
        error
      );
    }
  };

  // Function to fetch today's visitors count
  const fetchTodayVisitorsCount = async () => {
    try {
      const companyId=localStorage.getItem("companyId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/todayVistedUsers/?companyId=${companyId}`
      );
      setTodayVisitorsCount(response.data.data.todayVisitors || 0);
    } catch (error) {
      console.error("Error fetching today's visitors count:", error);
    }
  };

  // Function to fetch total Employee count
  const fetchTotalEmployee = async () => {
    try {
      const adminId=localStorage.getItem("adminId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/deptUser/totalDeptUser/?adminId=${adminId}`
      );
      setTotalEmployeeCount(response.data.data.totalDeptUsers || 0);
    } catch (error) {
      console.error("Error fetching total employee count", error);
    }
  };

  // Function to fetch total security count
  const fetchTotalSecurity = async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/totalUsers/?adminId=${adminId}`
      );
      setTotalSecurityCount(response.data.data.totalUser || 0);
    } catch (error) {
      console.error("Error fetching total security count", error);
    }
  };

  // Function to fetch Total Missed Records
  const fetchMissedRecordsCount = async () => {
    try {
      const companyId =localStorage.getItem("companyId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/missedRecordCount/?companyId=${companyId}`
      );

      setMissedRecordsCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching missed records count ", error);
    }
  };

  // useEffect to call the APIs on component mount
  useEffect(() => {
    fetchNewRequestsCount();
    fetchTodayVisitorsCount();
    fetchTotalEmployee();
    fetchTotalSecurity();
    fetchMissedRecordsCount();
  }, []);

  // Update cardData with dynamic counts
  const updatedCardData = cardData.map((item) => {
    if (item.title === "New Request") {
      item.count = newRequestsCount;
    } else if (item.title === "Total Visitors") {
      item.count = totalVisitorsCount;
    } else if (item.title === "Today Visitors") {
      item.count = todayVisitorsCount;
    } else if (item.title === "Total Employee") {
      item.count = totalEmployeecount;
    } else if (item.title === "Total Security") {
      item.count = totalSecurityCount;
    } else if (item.title === "Missed Out Records") {
      item.count = missedRecordsCount;
    }
    return item;
  });

  return (
    <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
      {updatedCardData.map((item, index) => (
        <div className="col" key={index}>
          <div
            className={`card shadow-none border h-100 bg-gradient-start-${
              index + 1
            }`}
          >
            <div className="card-body p-20">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <p className="fw-medium text-primary-light mb-1">
                    {item.title}
                  </p>
                  <h6 className="mb-0">{item.count}</h6>
                </div>
                <div
                  className={`w-50-px h-50-px ${item.bg} rounded-circle d-flex justify-content-center align-items-center`}
                >
                  <Icon icon={item.icon} className="text-white text-2xl mb-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnitCountOne;
