import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getSolvedViolations');

  if (!response.ok) {
    throw new Error(`Failed to fetch Solved violations: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetSolvedViolation = () => {
    return useQuery({
        queryKey: ["solved_violations"],
        queryFn: fetchViolation,
        refetchInterval: 5000,
        refetchOnWindowFocus: false
    });
};
