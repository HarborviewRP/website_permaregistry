import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface LineChartProps {
  label: string;
  data: any;
}

const LineChart: React.FC<LineChartProps> = ({ data, label }) => {
  const chartData = {
    labels: data.map((item: any) => item.date),
    datasets: [
      {
        label: label,
        data: data.map((item: any) => item.count),
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
    <div className="bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white p-4 rounded-lg">

      <div style={{ width: '100%', height: 300 }}>
        <Line data={chartData} options={chartOptions as any} />
      </div>
    </div>
  );
};

export default LineChart;