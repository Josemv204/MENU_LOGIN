import React, { useState, useEffect } from "react";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import axios from "axios"; // Para la solicitud al backend

import "./App.css";

import revenueData from "./data/revenueData.json";

defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";

export const Dashboard = () => {
  const [salesData, setSalesData] = useState({ labels: [], ventas: [], presupuestos: [] });
  const [categoryData, setCategoryData] = useState([]); // Mejores vendedores
  const [customerData, setCustomerData] = useState({ labels: [], data: [] }); // Para customerCard

  // Función para agrupar datos por mes
  const groupDataByMonth = (data) => {
    const groupedData = {};

    data.forEach((item) => {
      const month = item.mes;
      if (!groupedData[month]) {
        groupedData[month] = { ventas: 0, presupuestos: 0 };
      }
      if (item.origen === "ventas") {
        groupedData[month].ventas += item.total;
      } else if (item.origen === "presupuestos") {
        groupedData[month].presupuestos += item.total;
      }
    });

    const meses = Object.keys(groupedData);
    const ventas = meses.map((mes) => groupedData[mes].ventas);
    const presupuestos = meses.map((mes) => groupedData[mes].presupuestos);

    return { meses, ventas, presupuestos };
  };

  // Solicitud al backend para ventas y presupuestos
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/dashboard/meses")
      .then((response) => {
        const { meses, ventas, presupuestos } = groupDataByMonth(response.data);

        setSalesData({
          labels: meses,
          ventas: ventas,
          presupuestos: presupuestos,
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Solicitud al backend para mejores vendedores
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/dashboard")
      .then((response) => {
        setCategoryData(response.data); // Guardamos directamente los datos del backend
      })
      .catch((error) => {
        console.error("Error fetching data for categoryCard:", error);
      });
  }, []);

  // Solicitud al backend para visitas a clientes (customerCard)
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/dashboard/visitas")
      .then((response) => {
        const labels = response.data.map((item) => item.user); // Extraer los nombres de usuario
        const data = response.data.map((item) => item.cantidad_visitas); // Extraer las cantidades de visitas

        setCustomerData({
          labels: labels,
          data: data,
        });
      })
      .catch((error) => {
        console.error("Error fetching data for customerCard:", error);
      });
  }, []);

  return (
    <div className="App">
      {/* Gráfico de ventas y presupuestos */}
      <div className="dataCard revenueCard">
        <Line
          data={{
            labels: salesData.labels, // Usamos los meses de la API
            datasets: [
              {
                label: "Ventas",
                data: salesData.ventas, // Datos de ventas
                backgroundColor: "#064FF0",
                borderColor: "#064FF0",
              },
              {
                label: "Presupuestos",
                data: salesData.presupuestos, // Datos de presupuestos
                backgroundColor: "#FF3030",
                borderColor: "#FF3030",
              },
            ],
          }}
          options={{
            elements: {
              line: {
                tension: 0.5,
              },
            },
            plugins: {
              title: {
                text: "Ventas y presupuestos mensuales",
              },
            },
          }}
        />
      </div>

      {/* Gráfico de visitas a clientes */}
      <div className="dataCard customerCard">
        <Bar
          data={{
            labels: customerData.labels, // Nombres de usuario
            datasets: [
              {
                label: "Cantidad de visitas",
                data: customerData.data, // Cantidades de visitas
                backgroundColor: [
                  "rgba(43, 63, 229, 0.8)",
                  "rgba(250, 192, 19, 0.8)",
                  "rgba(253, 135, 135, 0.8)",
                ],
                borderRadius: 5,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                text: "Visitas a clientes",
              },
            },
          }}
        />
      </div>

      {/* Gráfico de mejores vendedores */}
      <div className="dataCard categoryCard">
        <Doughnut
          data={{
            labels: categoryData.map((data) => data.nombre_vendedor), // Etiquetas: nombres de vendedores
            datasets: [
              {
                label: "Total de Ventas",
                data: categoryData.map((data) => data.total_ventas), // Datos: totales de ventas
                backgroundColor: [
                  "rgba(43, 63, 229, 0.8)",
                  "rgba(250, 192, 19, 0.8)",
                  "rgba(253, 135, 135, 0.8)",
                ],
                borderColor: [
                  "rgba(43, 63, 229, 0.8)",
                  "rgba(250, 192, 19, 0.8)",
                  "rgba(253, 135, 135, 0.8)",
                ],
                borderWidth: 1,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                text: "Mejores vendedores",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;

