"use client";
import ECommerce from "@/components/Constraints/constraints";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSession } from '../../context/context';
import UploadCSV from "../../components/Uploader/csv";
import UploadConstraints from "../../components/Uploader/constrsints";




export default function Home() {


  const { propertyForm, updatePropertyForm } = useSession();

  const handleAddUser = () => {
    const newUser = { username: 'JohnDoe', link: 'https://example.com' };
    updatePropertyForm({
      users: [...(propertyForm?.users || []), newUser],
    });
  };


 
  return (
    <>
      <DefaultLayout>
      
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        
      <div className="relative col-span-12 flex flex-col justify-between rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
      Constraints
      </h4>
      

      <div className="h-96 w-full px-4 overflow-y-scroll space-y-4">
        {propertyForm?.constraints.map((user:any, index:Number) => (
          
            <div key={index.toString()} className="flex items-center justify-between border-b-2 pb-2 w-full overflow-hidden">
              
                <h5 className="font-medium text-black ">
                  {user}
                </h5>
                 
                 

            </div>
          
        ))}
      </div>
    </div>
      </div>
    
      </DefaultLayout>
    </>
  );
  // if(!propertyForm) return <UploadConstraints/>;
  // // if(!propertyForm) return <UploadCSV/>;
  // else{
  //   if(!propertyForm.constraintsFinished){
  //     return <UploadConstraints/>;
  //   }
  //   else{
  //     return (
  //       <>
  //         <DefaultLayout>
  //           <ECommerce />
  //         </DefaultLayout>
  //       </>
  //     );
  //   }
  // }

  
}
