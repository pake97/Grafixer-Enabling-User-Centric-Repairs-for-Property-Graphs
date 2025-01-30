import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getFullRepairs');

  if (!response.ok) {
    throw new Error(`Failed to fetch repairs: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetFullRepair = () => {
    return useQuery({
        queryKey: ["fullrepairs"],
        queryFn: fetchViolation,
        refetchInterval: 5000,
        refetchOnWindowFocus: false
    });
};
