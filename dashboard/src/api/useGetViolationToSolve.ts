import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getViolationToRepair');

  if (!response.ok) {
    throw new Error(`Failed to fetch violation to repair: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetViolationToRepair = () => {
    return useQuery({
        queryKey: ["violationToRepair"],
        queryFn: fetchViolation
    });
};
