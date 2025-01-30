
"use client";
import { useGetFree } from "@/api/useGetFree";
import ECommerce from "@/components/Constraints/constraints";
import { useRouter } from "next/navigation";
import { useEffect } from "react";







export default function Home({ params }: { params: { slug: string } }) {

  //const {data, error, isLoading} = useGetFree();

  const router = useRouter();



  return (
    <>
      <div className="flex w-full h-screen justify-center items-center text-3xl text-black text-center">
        There are not free violations at the moment.<br/> Please wait for the next available slot.
      </div>
      
    </>
  );
    
}
