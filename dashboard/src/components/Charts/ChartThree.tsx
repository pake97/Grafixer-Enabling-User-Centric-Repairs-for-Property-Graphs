
import React, {useRef, useEffect} from "react";

import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';

interface schemaProps {
  nodes: any;
  edges: any;
}

const ChartThree = ({nodes,edges}:schemaProps) => {

  console.log(nodes)
  console.log(edges)
  const networkRef = useRef<HTMLDivElement>(null);
  // Initialize the graph
  useEffect(() => {
    if (!networkRef.current) return; // Ensure ref is not null
  
    const data = {
      nodes: nodes.map((node:any) => ({id: node.id, label: node.properties.name})).filter((node:any) => node.label !== 'Violation' && node.label !== 'User' && node.label !== 'Repair' && node.label !== 'SolvedViolation' ),
      edges: edges.map((edge:any) => ({from: edge.nodes[0], to: edge.nodes[1], title : edge.type, label: edge.type})),
    };
  
    console.log(data);
  
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
  
    const network = new Network(networkRef.current, data, options); // Now it's safe to use
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
  
    return () => {
      network.destroy();
    };
  }, [nodes, edges]); // Include dependencies to handle updates

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Graph Schema
          </h5>
        </div>
        <div>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
        <div
        ref={networkRef}
        className="w-full h-80 border-1 mt-8"
        
      />
        </div>
      </div>

      
    </div>
  );
};

export default ChartThree;
