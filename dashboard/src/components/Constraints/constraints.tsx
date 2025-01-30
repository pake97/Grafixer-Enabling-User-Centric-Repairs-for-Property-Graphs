"use client";
import React, {useEffect, useState, useRef} from "react";
import Link from "next/link";
import { useSession } from '../../context/context';
import {useGetViolationToRepair} from "../../api/useGetViolationToSolve";
import { data, Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';
import Loader from "../Loaders/circularLoader";
import useArray from "@/hooks/useArray";
import { useApplyRepair } from "@/api/useApplyRepair";
import { useRouter } from "next/navigation";

  

type schemaProps = {
  username: string;
}

const ECommerce: React.FC<schemaProps> = ({username}:schemaProps) => {


    
  
    const [showModal, setShowModal] = useState(false);
    const { propertyForm, updatePropertyForm } = useSession();
    const { data:violation, isLoading:isLoadingViolation, error:errorV } = useGetViolationToRepair();
    const router = useRouter();
    const {applyRepair} = useApplyRepair(()=>window.location.reload());

    


    
    const {array, set, push, filter, update, remove, clear} = useArray([]);

    const networkRef = useRef<HTMLDivElement>(null);
    const networkRef1 = useRef<HTMLDivElement>(null);
    // Initialize the graph
    useEffect(() => {
      console.log(violation);
      if(violation && violation.message==='Wait'){
        console.log("Wait");
        router.push("/wait/"+username);
        console.log("perché non pushi?");
        return;
      }

      if(violation && violation.message==='Finish'){
        console.log("Finish");
        router.push("/finish/"+username);
        return;
      }

      if (!networkRef.current || !networkRef1.current) return; // Ensure ref is not null
    
      const context_data = {
        nodes: violation.context.nodes.filter((node:any) => node.label !== 'Violation' && node.label !== 'User' && node.label !== 'Repair' && node.label !== 'SolvedViolation' ),
        edges: violation.context.relationships,
      };
    
      const violation_data = {
        nodes: violation.violation.nodes,
        edges: violation.violation.relationships,
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
    }, [violation]); // Include dependencies to handle updates
  
  

    const apply = ()=>{
      var repair = ""
      array.forEach((item,idx)=>{
        
        const index = violation.repairs.indexOf(item);
        console.log(violation.atomic_repairs);
        console.log(index);
        
        if(idx!==array.length-1){
          repair+=violation.atomic_repairs[index]+" UNION ";
        }
        else{
          repair+=violation.atomic_repairs[index];
        }
      })
      console.log(repair);
      applyRepair({repair:repair, violation:violation, username : username});
    }

  
  return (
    <>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {/* {showModal && <Modal onClose={()=>setShowModal(false)} refetch={refetch}/>} */}
        <h4 className="mb-6 px-7.5 col-span-12 text-3xl font-semibold text-black dark:text-white">
        <span className="text-2xl font-normal">Repair this Violation caused by :</span> {isLoadingViolation?"":violation.text}
      </h4>
      <div className="relative col-span-12 flex flex-col justify-between rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12">
      
      {/* <button onClick={()=>setShowModal(true)} className="h-8 w-8 bg-secondary top-6 right-6 absolute rounded-full p-1"><svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fillRule="evenodd" > <g id="Icon-Set"  transform="translate(-464.000000, -1087.000000)" fill="#ffffff"> <path d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z" id="plus-circle" > </path> </g> </g> </g></svg></button> */}
      <div className="h-[2vh] w-full px-4 flex ">
        <div className="w-[49%] h-[2vh] ">
          <h4 className=" text-xl font-semibold text-black ">
            Violation</h4>
        </div>
        <div className="w-[49%] h-[2vh] flex justify-end">
          <h4 className=" text-xl font-semibold text-black ">
            Context (neighborhood)</h4>
        </div>
        <div className="w-[60%] h-[2vh] border-1 mt-8"></div>
      </div>
      <div className="h-[50vh] w-full px-4 flex ">
        {/* {isLoadingUsers||!users.users?<button onClick={()=>setShowModal(true)} className="bg-primary text-white text-xl py-2 px-4 ml-4 rounded-xl">Add User</button>:*/}
        {isLoadingViolation?<Loader/>:<div
        ref={networkRef}
        className="w-[39%] h-[50vh] border-1 mt-8 border-r-1 border-black"
        
      />}
      <div className="w-[0.1%] h-full bg-black"></div>
        {isLoadingViolation?<Loader/>:<div
        ref={networkRef1}
        className="w-[60%] h-[50vh] border-1 mt-8"
        
      />}
      </div>
     
    </div>
    {showModal && <Modal onClose={()=>setShowModal(false)} add={push} repairs={violation?.repairs} atomicRepairs={violation?.atomic_repairs} array={array}/>}
    <div className="col-span-12 h-[20vh] bg-white flex flex-col items-start justify-start p-4 rounded-lg">
          <h2 className="font-bold text-2xl">How would you repair this violation?</h2>
          <div className="flex mt-4 w-full gap-4 items-center"><p className="text-xl">Add one or more transformation:</p><button onClick={()=>setShowModal(true)} className="bg-primary rounded-xl text-white py-1 px-6 ">Add Transformation</button></div>

          <div className="flex gap-6 w-full mt-4 text-xl text-black">Your Repair : {array.map((item,idx)=>(<><div key={idx+"item"} className="relative flex gap-2">{item} <button onClick={()=>remove(idx)} className="bg-red w-4 h-4 flex items-center justify-center rounded-full text-white font-bold">-</button></div> {idx!==(array.length-1)&& '&'} </>))}</div>
          {array.length>0&&<button onClick={apply} className="bg-green-600 rounded-xl text-white py-2 px-6 mt-4">Apply</button>}
      </div>
      </div>
    </>
  );
};

export default ECommerce;


type modalProps = {
onClose: ()=>void,
add : (transformation:string)=>void,
repairs : string[],
atomicRepairs : string[],
array: string[]
}

const Modal = ({onClose,add, repairs, atomicRepairs,array}: modalProps)=>{

    const [transformation, setTransformation] = useState<string>(repairs[0]);
    const [params,setParams] = useState<string>("");
    

    const handleChange = (e : any)=>{
      setTransformation(e.target.value);
    }


    const addTransformation = ()=>{
      if(!array.includes(transformation)){
      if(params!==''){
        add(transformation+ " with " + params);
      }
      else{
        add(transformation);
      }
    }
    else{
      alert("You have already already added this Transformation");
    }
      onClose();
    }

    return (<div id="defaultModal" tabIndex={-1} aria-hidden="true" className="flex  overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-full ">
        <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
            
            <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
            
                <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 ">
                        Add a transformation
                    </h3>
                    <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
            
                
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                        
                            <select onChange={handleChange} value={transformation}>
                              {repairs.map((repair,idx)=>(<option key={idx} value={repair}>{repair}</option>))}
                            </select>
                            
                        {transformation.includes('Update')&&<input type="text" className="border rounded-lg border-gray-500 p-2" placeholder="new value" value={params} onChange={(e)=>setParams(e.target.value)}/>}
                        <div className="flex items-end">
                            <button onClick={addTransformation} className="bg-secondary py-2 px-4 text-white rounded-xl">Add</button>
                        </div>
                       
                    </div>
                
            </div>
        </div>
    </div>)
}