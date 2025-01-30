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
import { useGetRepair } from "@/api/useGetRepair";
import { useGetIteration } from "@/api/useGetIteration";
import { useGetInteraction } from "@/api/useGetInteraction";

import Loader from "../Loaders/circularLoader";
import { useQuery } from "@tanstack/react-query";
import { useGetSchema } from "@/api/useGetSchema";


type SocketType = Socket | null;

const MapOne = dynamic(() => import("@/components/Maps/MapOne"), {
  ssr: false,
});

const ChartThree = dynamic(() => import("@/components/Charts/ChartThree"), {
  ssr: false,
});

const ECommerce: React.FC = () => {

  
  const { data:violations, isLoading:isLoadingViolation, error:errorV } = useGetViolation();
  const { data:solved_violations, isLoading:isLoadingSolvedViolation, error:errorSV } = useGetSolvedViolation();
  const { data:repairs, isLoading:isLoadingRepairs, error:errorR } = useGetRepair();
  const { data:users, isLoading:isLoadingUsers, error:errorU } = useGetUser();
  const { data:iterations, isLoading:isLoadingIterations, error:errorIt } = useGetIteration();
  const { data:interactions, isLoading:isLoadingInteractions, error:errorInt } = useGetInteraction();
  const { data:schema, isLoading:isLoadingSchema, error:errorSchema } = useGetSchema();
  
  
  

  
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        {isLoadingViolation?<Loader/>:<CardDataStats title="Remaining Violations" total={JSON.parse(violations.violations).length} rate={"%"} levelUp>
        <svg width="800px" height="800px" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 16V14.5M12.5 9V13M20.5 12.5C20.5 16.9183 16.9183 20.5 12.5 20.5C8.08172 20.5 4.5 16.9183 4.5 12.5C4.5 8.08172 8.08172 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5Z" stroke="#121923" strokeWidth="1.2"/>
</svg>
        </CardDataStats>}
        {isLoadingUsers?<Loader/>:<CardDataStats title="Users" total={JSON.parse(users.users).length} rate="4.35%" levelUp>
        <svg width="800px" height="800px" viewBox="0 0 1024 1024" fill="#000000" className="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M962.4 1012.8s0 0.8 0 0h25.6-25.6zM704 338.4C704 195.2 588.8 78.4 445.6 78.4S187.2 195.2 187.2 338.4s116 260 258.4 260S704 481.6 704 338.4z m-472 0c0-118.4 96-214.4 213.6-214.4s213.6 96 213.6 214.4-96 214.4-213.6 214.4S232 456.8 232 338.4z" fill="" /><path d="M456.8 621.6c196.8 0 361.6 136 394.4 324h45.6C863.2 732 677.6 576.8 456 576.8c-221.6 0-406.4 155.2-440.8 368.8h45.6C96 756.8 260 621.6 456.8 621.6z" fill="" /><path d="M770.4 578.4l-24-8.8 20.8-14.4c65.6-46.4 104.8-122.4 103.2-202.4-1.6-128-102.4-232.8-228-241.6v47.2c100 8.8 180 92.8 180.8 194.4 0.8 52.8-19.2 102.4-56 140.8-36.8 37.6-86.4 59.2-139.2 60-24.8 0-50.4 0-75.2 1.6-15.2 1.6-41.6 0-54.4 9.6-1.6 0.8-3.2 0-4.8 0l-9.6 12c-0.8 1.6-2.4 3.2-4 4.8 0.8 1.6-0.8 16 0 17.6 12 4 71.2 0 156.8 2.4 179.2 1.6 326.4 160.8 340.8 338.4l47.2 3.2c-9.6-156-108-310.4-254.4-364.8z" fill="" /></svg>
        
        </CardDataStats>}
        {/* {isLoadingIterations?<Loader/>:<CardDataStats title="Number of Iteration" total={JSON.parse(iterations.iterations).length} rate="2.59%" levelUp>
        <svg width="800px" height="800px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.05005 15.81L10.6201 12.11C10.8201 11.9 11.1501 11.91 11.3401 12.12L12.14 12.98C12.34 13.19 12.6701 13.19 12.8701 12.98L14.94 10.81" stroke="#0F0F0F" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M16.88 12.86L16.95 9.41C16.95 9.1 16.7001 8.84 16.4001 8.84L12.9301 8.86" stroke="#0F0F0F" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M12 22C17.2467 22 21.5 17.7467 21.5 12.5C21.5 7.25329 17.2467 3 12 3C6.75329 3 2.5 7.25329 2.5 12.5C2.5 17.7467 6.75329 22 12 22Z" stroke="#0F0F0F" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
        </CardDataStats>} */}
        {isLoadingInteractions?<Loader/>:<CardDataStats title="Number of Interactions" total={JSON.parse(interactions.interactions).length} rate="0.95%" levelDown>
        <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12v8h-1v-8zm-4 8V7h-1v13zm-4 0V2h-1v18zm-4 0V7H9v13zm-5 0h1v-8H5zM1 1v22h22v-1H2V1z"/><path fill="none" d="M0 0h24v24H0z"/></svg>
        </CardDataStats>}
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
      {isLoadingSolvedViolation?<Loader/>:<ChartOne repairs={repairs?JSON.parse(repairs.repairs):[]}/>}
        {isLoadingUsers?<Loader/>:<ChatCard users={JSON.parse(users.users)}/>}
        
        {isLoadingSchema?<Loader/>:<ChartThree nodes={schema.schema.nodes} edges = {schema.schema.relationships}/>}
        
        <div className="col-span-12 xl:col-span-7">
          {isLoadingRepairs?<Loader/>:<TableOne repairs={JSON.parse(repairs.repairs)}/>}
        </div>
        {/* <MapOne />
        <ChartTwo /> */}
      </div>
    </>
  );
};

export default ECommerce;

