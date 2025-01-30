import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getViolations');

  if (!response.ok) {
    throw new Error(`Failed to fetch violations: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetViolation = () => {
    return useQuery({
        queryKey: ["violations"],
        queryFn: fetchViolation,
        refetchInterval: 5000,
        refetchOnWindowFocus: false
    });
};
