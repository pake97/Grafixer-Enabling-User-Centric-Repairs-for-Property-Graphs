import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getSchema');

  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetSchema = () => {
    return useQuery({
        queryKey: ["schema"],
        queryFn: fetchViolation,
        staleTime: 30000,
    });
};
