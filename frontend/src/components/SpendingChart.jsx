import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const SpendingChart = ({ smaData }) => {
  if (!smaData || smaData.length === 0) {
    return (
      <div className="chart-card glass-panel loading">
        <h3>Spending Trend</h3>
        <p>No enough data for SMA calculation yet.</p>
      </div>
    );
  }

  // Format data for chart
  const formattedData = smaData.map(item => ({
    date: item.date,
    sma: item.value,
  }));

  return (
    <div className="chart-card glass-panel">
      <h3>Spending Benchmark</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="date" 
              hide={true}
            />
            <YAxis 
              stroke="var(--text-secondary)" 
              fontSize={12}
              tickFormatter={(value) => `£${value}`}
            />
            <Tooltip 
              contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px' }}
              labelStyle={{ color: 'var(--text-h)', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line 
              name="7-Day SMA" 
              type="monotone" 
              dataKey="sma" 
              stroke="var(--natwest-purple)" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-info">
        The purple line shows your average daily spending trend.
      </p>
    </div>
  );
};

export default SpendingChart;
