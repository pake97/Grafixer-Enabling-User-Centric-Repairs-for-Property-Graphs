'use client'
import React, { useState } from 'react';
import { useSession } from '../../context/context';
import Loader from '../Loaders/circularLoader';
const UploadCSV: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const { propertyForm, updatePropertyForm } = useSession();
    const [loading, setLoading] = useState<boolean>(false);
  
    
  

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('http://127.0.0.1:5000/upload', {
                method: 'POST',
                body: formData,
            });
    
            const data = await response.json();  // Parse response as JSON
            
            if (response.ok) {
                alert(data.message);  // Use the message from the backend
                updatePropertyForm({
                    graph: data.schema,
                  });
                  setLoading(false);
            }
        } catch (error) {
            alert('An error occurred while uploading.');
        }
    };

    return (
        <div className="max-w-lg mx-auto h-screen flex flex-col justify-between items-center">
            <div className='flex flex-col items-center mt-40'>
            <img src="/images/graphixer.png" alt="logo" className="w-48 h-48 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Welcome to GraFixer</h1>
            {loading?<Loader/>:<div>
            <p className='mb-4'>Upload your graph (csv) to start</p>
            <form onSubmit={handleSubmit} className='flex flex-col items-center'>
                <input 
                    type="file" 
                    name="file" 
                    className="block w-full text-gray-700 border border-gray-300 rounded py-2 px-3" 
                    onChange={handleFileChange}
                />
                <button 
                    type="submit" 
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Upload
                </button>
            </form>
            </div>}
            </div>
            <div className='flex flex-col items-center mt-20 text-center w-[80vw] mb-20'>
                <h1 className='font-bold text-xl'>GraFixer :Grafixer: Enabling User-Centric Repairs for Property Graphs</h1>
                <p><strong>Amedeo Pachera </strong> - Lyon1 University, CNRS Liris - Lyon, France - amedeo.pachera@univ-lyon1.fr</p>
                <p><strong>Angela Bonifati </strong> - Lyon1 University, CNRS Liris& IUF -  Lyon, France - angela.bonifati@univ-lyon1.fr</p>
                <p><strong>Andrea Mauri </strong> - Lyon1 University, CNRS Liris - Lyon, France - andrea.mauri@univ-lyon1.fr</p>
            </div>
        </div>
    );
};

export default UploadCSV;
