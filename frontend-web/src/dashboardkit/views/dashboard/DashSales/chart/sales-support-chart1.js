import { CODAKIS_CHART } from 'config/chartTheme';

export function SalesSupportChartData1() {
  return {
    height: 85,
    type: 'bar',
    options: {
      chart: {
        sparkline: {
          enabled: true
        },
        background: 'transparent'
      },
      colors: [CODAKIS_CHART.primary],
      plotOptions: {
        bar: {
          columnWidth: '70%'
        }
      },
      xaxis: {
        crosshairs: {
          width: 1
        }
      },
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter() {
              return '';
            }
          }
        },
        marker: {
          show: false
        }
      },
      theme: {
        mode: 'light'
      }
    },
    series: [
      {
        data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54, 44, 12, 36, 9, 54, 25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 25, 44, 12, 36, 9, 54]
      }
    ]
  };
}
