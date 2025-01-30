"use client";
import React, {useEffect, useState, useRef} from "react";
import { useGetUser } from "@/api/useGetUser";
import Link from "next/link";
import { useAddUser } from "@/api/useAddUser";
import {useRemoveUser} from "@/api/useRemoveUser";
import {QrCode} from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/Dialogues/dialog';

const generateQRCode = async (userId:string) => {   
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=invite_${userId}`
  }

  type usertype = {
    id: string,
    username: string,
    link: string
  }

const ECommerce: React.FC = () => {

  
  const { data:users, isLoading:isLoadingUsers, error:errorU, refetch } = useGetUser();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<String|null>(null)
  const [qrCode, setQrCode] = useState<String>("")
  
  const {removeUserMutation} = useRemoveUser(()=>{ void refetch();});

  const handleGenerateQR = async (user : usertype) => {
    setSelectedUser(user.username)
    const qrCodeUrl = await generateQRCode(user.link)
    setQrCode(qrCodeUrl)
  }


  const removeUser = (username: string) => {
    removeUserMutation({username})
  }
  
  return (
    <>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {showModal && <Modal onClose={()=>setShowModal(false)} refetch={refetch}/>}
      <div className="relative col-span-12 flex flex-col justify-between rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Users
      </h4>
      <button onClick={()=>setShowModal(true)} className="h-8 w-8 bg-secondary top-6 right-6 absolute rounded-full p-1"><svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fillRule="evenodd" > <g id="Icon-Set"  transform="translate(-464.000000, -1087.000000)" fill="#ffffff"> <path d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z" id="plus-circle" > </path> </g> </g> </g></svg></button>

      <div className="h-96 w-full px-4 overflow-y-scroll">
        {isLoadingUsers||!users.users?<button onClick={()=>setShowModal(true)} className="bg-primary text-white text-xl py-2 px-4 ml-4 rounded-xl">Add User</button>:JSON.parse(users.users).map((user:any, index:Number) => (
          
            <div key={index.toString()} className="flex items-center justify-between border-b-2 pb-2 w-full overflow-hidden">
              
                <h5 className="font-medium text-black ">
                  {user.username}
                </h5>
                    <Link href={user.link}>{user.link}</Link>    
              
                    <Dialog>
                        <DialogTrigger asChild>
                          <button  onClick={() => handleGenerateQR(user)} className="flex gap-2 items-center">
                            <QrCode className="mr-2 h-4 w-4" /> Generate QR
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invitation QR Code for User {selectedUser}</DialogTitle>
                          </DialogHeader>
                          {qrCode && (
                            <div className="flex flex-col items-center">
                              <img src={qrCode.toString()} alt={`QR Code for ${selectedUser}`} />
                              <p className="mt-2 text-sm text-muted-foreground">
                                Scan this QR code to join the repair session or visit <a href={"http://localhost:3000/repair-process?user="+selectedUser}>this link</a>
                              </p>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <button  onClick={() => removeUser(user.username)} className="bg-red-500 rounded-xl text-white py-1 px-5"> Remove</button>
                  
              

            </div>
          
        ))}
      </div>
    </div>
      </div>
    </>
  );
};

export default ECommerce;


type modalProps = {
onClose: ()=>void,
refetch: ()=>void
}

const Modal = ({onClose, refetch}: modalProps)=>{


    const {addUser} = useAddUser(()=>{onClose(); refetch();});
    const [username, setUsername] = useState<string>("");

    const handleAdd = ()=>{
        addUser({username});
    }

    return (<div id="defaultModal" tabIndex={-1} aria-hidden="true" className="flex bg-gray-100 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-full ">
        <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
            
            <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
            
                <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 ">
                        Add New User
                    </h3>
                    <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
            
                
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 ">Username</label>
                            <input type="text" name="username" id="username" onChange={(e)=>setUsername(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type username" required/>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleAdd} className="bg-secondary py-2 px-4 text-white rounded-xl">Add</button>
                        </div>
                       
                    </div>
                
            </div>
        </div>
    </div>)
}