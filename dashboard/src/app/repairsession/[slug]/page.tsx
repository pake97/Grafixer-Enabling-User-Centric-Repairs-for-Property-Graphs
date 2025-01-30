
"use client";
import ECommerce from "@/components/Constraints/constraints";







export default function Home({ params }: { params: { slug: string } }) {

 
    console.log(params.slug);

  return (
    <>
      
        <ECommerce username={params.slug}/>
      
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
