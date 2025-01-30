import React, { useState } from 'react';
import { useSession } from '../../context/context';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';

interface CsvData {
    [key: string]: string; // Adjust the type based on your CSV structure
  }


const UploadConstraints: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'file' | 'text' | 'gpt'>('file');
    const [file, setFile] = useState<File | null>(null);
    const [textInput, setTextInput] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { propertyForm, updatePropertyForm } = useSession();
    const [data,setdata] = useState<any>(null);

    const saveConstraints =async () => {
        

        const endpoint = 'http://127.0.0.1:5000/upload_constraints';

        try {
            const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ constraints : data }), // Send the constraints as JSON
            });

            console.log(response);

            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            else{
                updatePropertyForm({
                    constraintsFinished: true,
                  });
            }            
        } catch (error) {
            console.error('Error sending constraints to Flask:', error);
        }

          

    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0]; // Use optional chaining
        if (file) {
          setError(null); // Reset error state
          Papa.parse<CsvData>(file, {
            header: true, // Set to true if your CSV has headers
            skipEmptyLines: true,
            delimiter: '|',
            newline: "\n",	// auto-detect
            quoteChar: '"',
            escapeChar: '"',
            complete: (results:any) => {
                setdata(results.data);
                const addedConstraints = results.data.map((row:any) => row.constraints);
                    updatePropertyForm({
                      constraints: [...(propertyForm?.constraints || []), ...addedConstraints],
                      constraintsFinished:false,
                    });
                },
            error: (error : any) => {
              console.error('Error parsing CSV:', error);
              setError('Error parsing CSV file. Please check the format.');
            },
          });
        }
    };

    const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'file' && file) {
        
            
         console.log(file);
              

        } else if (activeTab === 'text' && textInput) {
            updatePropertyForm({
                constraints: [...(propertyForm?.constraints || []), textInput],
              });
        } else {
            alert('Please complete the form in the active tab.');
            return;
        }
    };

   const removeConstraint = (index: number) => {
        const constraints = propertyForm?.constraints || [];
        const newConstraints = constraints.filter((_, i) => i !== index);
        updatePropertyForm({
            constraints: newConstraints,
          });
   }

    return (
        <div className="max-w-6xl mx-auto h-screen flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold mb-4">Upload Constraints</h1>
            <div className="flex mb-4 border-b">
                <button 
                    className={`px-4 py-2 ${activeTab === 'file' ? 'border-b-2 border-blue-500' : ''}`} 
                    onClick={() => setActiveTab('file')}
                >
                    Upload CSV
                </button>
                <button 
                    className={`px-4 py-2 ${activeTab === 'text' ? 'border-b-2 border-blue-500' : ''}`} 
                    onClick={() => setActiveTab('text')}
                >
                    Write Cypher Queries
                </button>
                {/* <button 
                    className={`px-4 py-2 ${activeTab === 'gpt' ? 'border-b-2 border-blue-500' : ''}`} 
                    onClick={() => setActiveTab('gpt')}
                >
                    Ask GPT
                </button> */}
            </div>

            {activeTab === 'file' && (
                <form onSubmit={handleSubmit} className='flex flex-col items-center'>
                    <input 
                        type="file" 
                        name="file" 
                        accept=".csv" 
                        className="block w-full text-gray-700 border border-gray-300 rounded py-2 px-3 mb-4" 
                        onChange={handleFileChange}
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Upload
                    </button>
                </form>
            )}

            {activeTab === 'text' && (
                <form onSubmit={handleSubmit} className='flex flex-col items-center w-80'>
                    <textarea 
                        value={textInput} 
                        onChange={handleTextInputChange} 
                        placeholder="Write constraints here..." 
                        className="w-full border border-gray-300 rounded py-2 px-3 mb-4"
                        rows={6}
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Upload
                    </button>
                </form>
            )}

            {/* {activeTab === 'gpt' && (
                <div>
                    <button 
                        type="button" 
                        onClick={handleGptRequest} 
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Generate with GPT
                    </button>
                    {gptResponse && (
                        <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                            <h2 className="font-bold">GPT Response:</h2>
                            <p>{gptResponse}</p>
                        </div>
                    )}
                </div>
            )} */}
            <div className="relative flex flex-col w-full h-fit overflow-scroll text-gray-700 bg-white shadow-md rounded-xl bg-clip-border mb-8 mt-8">
  <table className="w-full text-left table-auto min-w-max h-fit">
    <thead>
      <tr>
        <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
          <p className="block font-sans text-base antialiased font-semibold  text-blue-gray-900 opacity-90">
            Constraint
          </p>
        </th>
        <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
          <p className="block font-sans text-base antialiased font-semibold  text-blue-gray-900 opacity-90">
            Action
          </p>
        </th>
        </tr>
    </thead>
    <tbody>
      
      {propertyForm?.constraints.map((constraint, index) => (<tr key={index} className='px-2 border-b-2'><td className='max-w-3xl overflow-clip p-2'>{constraint}</td><td className='p-2'><button className='bg-red-600 text-white px-4 py-1 rounded' onClick={()=>removeConstraint(index)}>Remove</button></td></tr>))}
      
    </tbody>
  </table>
</div>
            
            {propertyForm?.constraints.length! > 0 && <button 
                        onClick={saveConstraints}
                        className="bg-green-600 text-white px-4 py-2 rounded">
                        Save
                    </button>}

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default UploadConstraints;
