"use client";

import { ApexOptions } from "apexcharts";
import React, { use, useEffect } from "react";
import dynamic from "next/dynamic";
import useArray from "@/hooks/useArray";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const colors = ["#3C50E0", "#80CAEE", "#1E9C2A", "#E29311"];





const ChartOne = ({repairs}: any) => {

  
  const [series, setSeries] = React.useState<any>([]);
  const [chartOptions, setChartOptions] = React.useState<ApexOptions>({
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE", "#1E9C2A", "#E29311"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "area",
      dropShadow: {
        enabled: true,
        color: "#623CEA14",
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
  
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: "straight",
    },
    // labels: {
    //   show: false,
    //   position: "top",
    // },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: colors,
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: repairs.map((repair:any, index:number) => (index + 1).toString()),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: 0,
      max:  repairs.reduce((max:any, obj:any) => obj.solved > max.solved ? obj : max, repairs[0]).solved*4,
    },
  });

  const {array, set, push, filter, update, remove, clear} = useArray([series.map((serie:any) => serie.name)]);




  function cumulativeSumMultipleLists(...lists : any[]) {
    let maxLength = Math.max(...lists.map(arr => arr.length));
    let sum = 0;
    let result = [];
  
    for (let i = 0; i < maxLength; i++) {
      let currentSum = lists.reduce((acc, arr) => acc + (arr[i] || 0), 0);
      sum += currentSum;
      result.push(sum);
    }
  
    return result;
  }
  

  useEffect(() => {
    const seriess = repairs.reduce((acc:any, item:any) => {
      if (!acc[item.username]) {
        acc[item.username] = [];
      }
      acc[item.username].push(item.solved);
      return acc;
    }, {});
  
    const seriesss = Object.entries(seriess).map(([username, data], index) => ({
      name: username,
      data: data,
      color: colors[index % colors.length],
    }));
  
    const cumulative = cumulativeSumMultipleLists(...seriesss.map((serie:any) => serie.data));
    
    seriesss.push({
      name: "Total Violation Solved",
      data: cumulative,
      color: colors[seriesss.length % colors.length],
    });
  
    setSeries(seriesss);

    set(seriesss.map((serie:any) => serie.name));
  
    // Update chart colors dynamically
    setChartOptions((prev) => ({
      ...prev,
      colors: seriesss.filter((el)=>array.includes(el.name)).map((el, idx) => el.color),
      markers: {
        ...chartOptions.markers,
        colors: seriesss.filter((el)=>array.includes(el.name)).map((el, idx) => el.color),
      }
    }));
  }, [repairs]);
  
  
const handleChange = (name:string) => {
  console.log(name)
  console.log(series)
  const idx = series.findIndex((serie:any) => serie.name === name);
  console.log(idx)
  if(array.includes(name)){
    remove(idx);
  }else{
    push(series[idx].name);
  }
}

  console.log(array)
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <h2 className="font-bold text-gray-900 text-xl">Violation Solved</h2>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
       
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">

          {series.map((serie:any, idx:number)=>(<div key={idx} className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span onClick={()=>handleChange(serie.name)} className={`block h-2.5 w-full max-w-2.5 rounded-full`}
              style={{ backgroundColor:array.includes(serie.name)?colors[idx % colors.length]:'white' }} // Ensure colors cycle if more series exist
              ></span>
            </span>
            <div className="w-full">
              <p className={"font-semibold"} style={{ color: colors[idx % colors.length] }}>{serie.name}</p>
            </div>
          </div>))}
        </div>
        
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={
              chartOptions
            }
            series={series.filter((serie:any)=>array.includes(serie.name))}
            type="area"
            height={350}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
