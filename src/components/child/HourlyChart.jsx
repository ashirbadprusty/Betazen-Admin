import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const hourlyData = [
  { time: "9 AM - 10 AM", Visitors: 120,  },
  { time: "10 AM - 11 AM", Visitors: 95,  },
  { time: "11 AM - 12 PM", Visitors: 110,  },
  { time: "12 PM - 1 PM", Visitors: 130,  },
  { time: "1 PM - 2 PM", Visitors: 140,  },
  { time: "2 PM - 3 PM", Visitors: 125,  },
  { time: "3 PM - 4 PM", Visitors: 160,  },
  { time: "4 PM - 5 PM", Visitors: 150,  }
];

const HourlyChart = () => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h6>Hourly Scanned Visitors</h6>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={hourlyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="blue" stopOpacity={0.4} />
              <stop offset="95%" stopColor="blue" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="orange" stopOpacity={0.4} />
              <stop offset="95%" stopColor="orange" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="Visitors" stroke="blue" fill="url(#colorNew)" />
        </AreaChart>
      </ResponsiveContainer>

      <style jsx>{`
        .chart-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default HourlyChart;