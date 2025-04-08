import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import axios from 'axios';


const TotalSubscriberOne = () => {
  // let { barChartSeries, barChartOptions } = useReactApexChart()
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the data from the API
  const fetchDailyStats = async () => {
    try {
      const companyId=localStorage.getItem("companyId");
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/form/stats/?companyId=${companyId}`);
      const { dayCounts } = response.data.data; 
      setDailyStats(dayCounts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStats();
  }, []);

  let barChartSeries = [
    {
        name: "Scanned User",
        data: dailyStats.map((item) => ({
          x: item.day,  
          y: item.count, 
        })),
      },
  ];

  let barChartOptions = {
    chart: {
      type: "bar",
      height: 264,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: 24,
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      colors: ["#dae5ff"], // Set the starting color (top color) here
      gradient: {
        shade: "light", // Gradient shading type
        type: "vertical", // Gradient direction (vertical)
        shadeIntensity: 0.5, // Intensity of the gradient shading
        gradientToColors: ["#dae5ff"], // Bottom gradient color (with transparency)
        inverseColors: false, // Do not invert colors
        opacityFrom: 1, // Starting opacity
        opacityTo: 1, // Ending opacity
        stops: [0, 100],
      },
    },
    grid: {
      show: false,
      borderColor: "#D1D5DB",
      strokeDashArray: 4, // Use a number for dashed style
      position: "back",
      padding: {
        top: -10,
        right: -10,
        bottom: -10,
        left: -10,
      },
    },
    xaxis: {
      type: "category",
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    yaxis: {
      show: false,
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="barChart">
      <div className="card h-100 radius-8 border">
        <div className="card-body p-24">
          <h6 className="mb-12 fw-semibold text-lg mb-16">
            Day Wise Visitor Details
          </h6>
          <ReactApexChart
            options={barChartOptions}
            series={barChartSeries}
            type="bar"
            height={264}
          />
        </div>
      </div>
    </div>
  );
};

export default TotalSubscriberOne;
