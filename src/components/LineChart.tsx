import React from 'react';
import { Line } from 'react-chartjs-2';

interface LineChartData {
  date: string;
  count: number;
}

interface LineChartProps {
  data: LineChartData[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: 'Applications Submitted / Day',
        data: data.map((item) => item.count),
        borderColor: '#8884d8',
        borderWidth: 2,
        backgroundColor: 'rgba(136, 132, 216, 0.1)',
        pointBackgroundColor: '#8884d8',
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM DD',
            },
          },
          scaleLabel: {
            display: true,
            labelString: 'Date',
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
          scaleLabel: {
            display: true,
            labelString: 'Count',
          },
        },
      ],
    },
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h3 className="text-xl font-semibold mb-2">
        Applications Submitted / Day
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <Line data={chartData} options={chartOptions as any} />
      </div>
    </div>
  );
};

export default LineChart;