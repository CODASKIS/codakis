import { Row, Col, Card } from "react-bootstrap";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import FlatCard from "@/dashboardkit/components/Widgets/Statistic/FlatCard";
import ProductCard from "@/dashboardkit/components/Widgets/Statistic/ProductCard";
import FeedTable from "@/dashboardkit/components/Widgets/FeedTable";
import ProductTable from "@/dashboardkit/components/Widgets/ProductTable";
import { SalesCustomerSatisfactionChartData } from "@/dashboardkit/views/dashboard/DashSales/chart/sales-customer-satisfication-chart";
import { SalesAccountChartData } from "@/dashboardkit/views/dashboard/DashSales/chart/sales-account-chart";
import { SalesSupportChartData } from "@/dashboardkit/views/dashboard/DashSales/chart/sales-support-chart";
import { SalesSupportChartData1 } from "@/dashboardkit/views/dashboard/DashSales/chart/sales-support-chart1";
import GerantDashboardMoniteurs from "../components/GerantDashboardMoniteurs";
import { getRoleDashboardData } from "../data/codakisDashboardData";

function ConsortPieChart({ labels }) {
  const chart = SalesCustomerSatisfactionChartData();
  return (
    <Chart
      type="pie"
      height={220}
      series={[4, 1, 1]}
      options={{
        ...chart.options,
        labels,
        legend: { show: true, position: "bottom", offsetY: 0 },
      }}
    />
  );
}

function buildAccountChart(t, baseChart) {
  return {
    ...baseChart,
    series: baseChart.series.map((series, index) => ({
      ...series,
      name: index === 0 ? t("dashboard.widgets.progressSeries") : t("dashboard.widgets.examSeries"),
    })),
    options: {
      ...baseChart.options,
      tooltip: {
        ...baseChart.options.tooltip,
        y: {
          formatter(y) {
            if (typeof y !== "undefined") return String(y);
            return y;
          },
        },
      },
    },
  };
}

export default function CodakisDashHome({ role }) {
  const { t } = useTranslation();
  const data = getRoleDashboardData(role, t);

  const tableRows = data.tableRows.map((row) => ({
    ...row,
    image: <span className="text-muted">—</span>,
  }));

  const tableHeading = [
    data.tableHeading[0],
    "",
    data.tableHeading[1] ?? t("dashboard.widgets.colStatus"),
    data.tableHeading[2] ?? "",
    data.tableHeading[3] ?? t("dashboard.widgets.colAction"),
  ];

  const pieLabels = [
    t("dashboard.consort.status.validated"),
    t("dashboard.consort.status.pending"),
    t("dashboard.consort.status.missing"),
  ];

  const accountChart = buildAccountChart(t, SalesAccountChartData());

  return (
    <Row className="codakis-dash-home">
      {role === "gerant" ? (
        <Col md={12}>
          <GerantDashboardMoniteurs />
        </Col>
      ) : null}
      <Col md={12} xl={6}>
        <Card className="flat-card">
          <div className="row-table">
            {data.flatCards.slice(0, 3).map((item, index) => (
              <Card.Body
                key={item.title}
                className={`col-sm-6${index < 2 ? " br" : ""}${index === 2 ? " card-bod" : ""}${index === 1 ? " d-none d-md-table-cell d-lg-table-cell d-xl-table-cell card-body br" : ""}`}
              >
                <FlatCard params={{ title: item.title, iconClass: "text-primary mb-1", icon: item.icon, value: item.value }} />
              </Card.Body>
            ))}
          </div>
          <div className="row-table">
            {data.flatCards.slice(3, 6).map((item, index) => (
              <Card.Body
                key={item.title}
                className={`col-sm-6${index < 2 ? " br" : ""}${index === 2 ? " card-bod" : ""}${index === 1 ? " d-none d-md-table-cell d-lg-table-cell d-xl-table-cell card-body br" : ""}`}
              >
                <FlatCard params={{ title: item.title, iconClass: "text-primary mb-1", icon: item.icon, value: item.value }} />
              </Card.Body>
            ))}
          </div>
        </Card>

        <Row>
          <Col md={12} lg={6} className="mb-4 mb-lg-0">
            <Card className="support-bar overflow-hidden h-100">
              <Card.Body className="pb-0">
                <h2 className="m-0">{data.supportPrimary.value}</h2>
                <span className="text-primary">{data.supportPrimary.label}</span>
                <p className="mb-3 mt-3">{data.supportPrimary.hint}</p>
              </Card.Body>
              <div className="codakis-chart-wrap">
                <Chart {...SalesSupportChartData()} />
              </div>
              <Card.Footer className="border-0 bg-primary text-white background-pattern-white">
                <Row className="text-center">
                  {data.supportPrimary.footer.map((item) => (
                    <Col key={item.label}>
                      <h4 className="m-0 text-white">{item.value}</h4>
                      <span>{item.label}</span>
                    </Col>
                  ))}
                </Row>
              </Card.Footer>
            </Card>
          </Col>
          <Col md={12} lg={6}>
            <Card className="support-bar overflow-hidden h-100">
              <Card.Body className="pb-0">
                <h2 className="m-0">{data.supportSecondary.value}</h2>
                <span className="text-primary">{data.supportSecondary.label}</span>
                <p className="mb-3 mt-3">{data.supportSecondary.hint}</p>
              </Card.Body>
              <Card.Footer className="border-0">
                <Row className="text-center">
                  {data.supportSecondary.footer.map((item) => (
                    <Col key={item.label}>
                      <h4 className="m-0">{item.value}</h4>
                      <span>{item.label}</span>
                    </Col>
                  ))}
                </Row>
              </Card.Footer>
              <div className="codakis-chart-wrap">
                <Chart {...SalesSupportChartData1()} />
              </div>
            </Card>
          </Col>
        </Row>
      </Col>

      <Col md={12} xl={6}>
        <Card className="mb-4">
          <Card.Header>
            <h5>{data.chartTitle}</h5>
          </Card.Header>
          <Card.Body>
            <Row className="pb-2">
              <div className="col-auto m-b-10">
                <h3 className="mb-1">{data.chartTotal}</h3>
                <span>{t("dashboard.widgets.total")}</span>
              </div>
              <div className="col-auto m-b-10">
                <h3 className="mb-1">{data.chartAverage}</h3>
                <span>{t("dashboard.widgets.average")}</span>
              </div>
            </Row>
            <div className="codakis-chart-wrap">
              <Chart {...accountChart} />
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={12} xl={6}>
        <Card className="codakis-pie-card mb-4">
          <Card.Body>
            <h6>{data.pieTitle}</h6>
            <span>{data.pieHint}</span>
            <div className="codakis-pie-card__chart">
              <ConsortPieChart labels={pieLabels} />
            </div>
          </Card.Body>
        </Card>
        <ProductTable
          wrapclass="table-card feed-card"
          height="255px"
          title={data.tableTitle}
          tableheading={tableHeading}
          rowdata={tableRows}
        />
      </Col>

      <Col md={12} xl={6}>
        <Row>
          {data.productCards.map((card) => (
            <Col sm={6} key={card.title}>
              <ProductCard
                params={{
                  title: card.title,
                  primaryText: card.primaryText,
                  icon: card.icon,
                  variant: card.variant,
                }}
              />
            </Col>
          ))}
        </Row>
        <FeedTable
          wrapclass="feed-card"
          height="385px"
          title={data.feedTitle}
          options={data.feedItems}
        />
      </Col>
    </Row>
  );
}
