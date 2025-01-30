"use client";
import dynamic from "next/dynamic";
import React, {useEffect, useState, useRef} from "react";
import ChartOne from "../Charts/ChartOne";
import ChartTwo from "../Charts/ChartTwo";
import ChatCard from "../Chat/ChatCard";
import TableOne from "../Tables/TableOne";
import CardDataStats from "../CardDataStats";
import { useQueryClient } from "@tanstack/react-query";
import io, { Socket } from "socket.io-client";
import { useGetViolation } from "@/api/useGetViolation";
import { useGetSolvedViolation } from "@/api/useGetSolvedViolation";
import { useGetUser } from "@/api/useGetUser";
import { useGetFullRepair } from "@/api/useGetFullRepair";
import { useGetIteration } from "@/api/useGetIteration";
import { useGetInteraction } from "@/api/useGetInteraction";
import { data, Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';    
import Loader from "../Loaders/circularLoader";
import { useQuery } from "@tanstack/react-query";
import { useGetSchema } from "@/api/useGetSchema";


const ECommerce: React.FC = () => {

  
  const { data:repairs, isLoading:isLoadingRepairs, error:errorR } = useGetFullRepair();
  
  
  
  return (
    <>
        <div className="w-full h-screen ">
          {isLoadingRepairs?<Loader/>:  <div className="rounded-sm border h-full overflow-scroll relative border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Repair History
      </h4>
      
      <div className="flex flex-col h-full overflow-y-scroll">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-3">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              User
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Violations Solved
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
            Violations Introduced
            </h5>
          </div>
          {/* <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Sales
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Conversion
            </h5>
          </div> */}
        </div>

        {JSON.parse(repairs.repairs).map((repair:any, key:number) => (
          <RepairComponent repair={repair} key={key}/>
        ))}
      </div>
    </div>}
        </div>
    </>
  );
};

export default ECommerce;


interface props  {
    repair: any,
    key: number
}

const RepairComponent = ({repair,key}:props) => {

    console.log(repair)
    const [open,setOpen] = useState<boolean>(false);
    
    const networkRef = useRef<HTMLDivElement>(null);
    const networkRef1 = useRef<HTMLDivElement>(null);
    //Initialize the graph
    useEffect(() => {
      if (!networkRef.current || !networkRef1.current) return; // Ensure ref is not null
    // if (!networkRef.current ) return; // Ensure ref is not null
      const context_data = {
        nodes: JSON.parse(repair.new.replace(/\^/g, "'").replace(/\|/g, '"').replace("red", 'green')).nodes,
        edges: JSON.parse(repair.new.replace(/\^/g, "'").replace(/\|/g, '"').replace("red", 'green')).relationships,
      };
    
      const violation_data = {
        nodes: JSON.parse(repair.prev.replace(/\^/g, "'").replace(/\|/g, '"')).nodes,
        edges: JSON.parse(repair.prev.replace(/\^/g, "'").replace(/\|/g, '"')).relationships,
      }
    
      const options = {
        nodes: {
          shape: 'dot',
          size: 20,
        },
        edges: {
          width: 2,
        },
        autoResize: true,
        height: '100%',
        width: '100%',
        physics: {
          enabled: true,
          stabilization: {
            iterations: 10, // Helps stabilize large graphs
          },
        },
        interaction: {
          zoomView: true,
          dragView: true,
        },
        layout: {
          improvedLayout: false,
        },
      };
    
      const network = new Network(networkRef.current, violation_data, options); // Now it's safe to use
      network.fit({
        animation: {
          duration: 1000,
          easingFunction: "easeInOutQuad",
        },
      });
    
      // Optional: Listen for stabilization events to auto-adjust the view
      network.once("stabilized", () => {
        network.fit({
          animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad",
          },
        });
      });

      const context_network = new Network(networkRef1.current, context_data, options); // Now it's safe to use
      context_network.fit({
        animation: {
          duration: 1000,
          easingFunction: "easeInOutQuad",
        },
      });
    
      // Optional: Listen for stabilization events to auto-adjust the view
      context_network.once("stabilized", () => {
        context_network.fit({
          animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad",
          },
        });
      });
    
      return () => {
        network.destroy();
        context_network.destroy();
      };
    }, [repair,open]); // Include dependencies to handle updates
  
  



    return(
            <div
            className="grid grid-cols-3 sm:grid-cols-3"
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <button className=" text-black  mr-4 rounded-xl h-12 w-12" onClick={()=>setOpen(!open)}><svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 9L14 14.1599C13.7429 14.4323 13.4329 14.6493 13.089 14.7976C12.7451 14.9459 12.3745 15.0225 12 15.0225C11.6255 15.0225 11.2549 14.9459 10.9109 14.7976C10.567 14.6493 10.2571 14.4323 10 14.1599L5 9" stroke="#929292" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg></button>
              <p className="hidden text-black dark:text-white sm:block">
                {repair.username}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{repair.solved}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3">{repair.introduced}</p>
            </div>

            {/* <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{brand.sales}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-meta-5">{brand.conversion}%</p>
            </div> */}
            {open?<div className="col-span-3 flex border-b border-gray-400">
                
                        <div
                        ref={networkRef}
                        className="w-[48%] h-[30vh] border-1 mt-8 border-r-1 border-black"
                        
                      />
                        <div
                        ref={networkRef1}
                        className="w-[48%] h-[30vh] border-1 mt-8"
                        
                      />
                      {/* <div className="w-[48%] h-[30vh] border-1 mt-8 flex flex-col items-center justify-center text-black">
                        <p>{repair.repair}</p>
                      </div> */}

             </div>:null}
          </div>
    )
}


