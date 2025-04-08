
// Super Admin Dashboard Count

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const cardData = [
  {
    title: "Total Companies",
    count: 0,
    bg: "bg-cyan",
    icon: "gridicons:multiple-users",
  },
  { title: "Active Subscription", count: 0, bg: "bg-purple", icon: "fa-solid:award" },
  {
    title: "Expired Subscription",
    count: 0,
    bg: "bg-info",
    icon: "fluent:people-20-filled",
  },
];

const SuperAdminCount = () => {
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [totalVisitorsCount, setTotalVisitorsCount] = useState(0);
  const [todayVisitorsCount, setTodayVisitorsCount] = useState(0);

  // Function to fetch the new requests and total visitors count
  const fetchNewRequestsCount = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/form/reqRegCount`);
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
      const response = await axios.get(
        `${API_BASE_URL}/api/form/todayVistedUsers`
      );
      setTodayVisitorsCount(response.data.data.todayVisitors || 0);
    } catch (error) {
      console.error("Error fetching today's visitors count:", error);
    }
  };

  // useEffect to call the APIs on component mount
  useEffect(() => {
    fetchNewRequestsCount();
    fetchTodayVisitorsCount();
  }, []);

  // Update cardData with dynamic counts
  const updatedCardData = cardData.map((item) => {
    if (item.title === "Total Companies") {
      item.count = newRequestsCount;
    } else if (item.title === "Active Subscription") {
      item.count = totalVisitorsCount;
    } else if (item.title === "Expired Subscription") {
      item.count = todayVisitorsCount;
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

export default SuperAdminCount;
