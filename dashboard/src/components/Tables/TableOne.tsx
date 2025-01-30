import { BRAND } from "@/types/brand";
import Image from "next/image";

const brandData: BRAND[] = [
  {
    
    name: "Davd Helio",
    solved: 35,
    introduced: 6,
  },
  {
    
    name: "Henry Fisher",
    solved: 22,
    introduced: 5,
  },
  {
    
    name: "John Doe",
    solved: 21,
    introduced: 7,
  },
  {
    
    name: "John Doe",
    solved: 1,
    introduced: 0,
  },
  {
    
    name: "John Doe",
    solved: 3,
    introduced: 5,
  },
];

type repair ={
  username: string;
  solved: number;
  introduced: number;
}

type props = {
  repairs: repair[]
}

const TableOne = ({repairs}:props) => {
  console.log(repairs);
  return (
    <div className="rounded-sm border relative border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Repair History
      </h4>
      
      <div className="flex flex-col h-96 overflow-y-scroll">
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

        {repairs.map((repair, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-3 ${
              key === brandData.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
