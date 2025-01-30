"use client";
import ECommerce from "@/components/Users/users";
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
        <ECommerce />
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
