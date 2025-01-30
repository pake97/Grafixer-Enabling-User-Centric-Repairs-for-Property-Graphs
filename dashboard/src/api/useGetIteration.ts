import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getIterations');

  if (!response.ok) {
    throw new Error(`Failed to fetch iterations: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetIteration = () => {
    return useQuery({
        queryKey: ["iterations"],
        queryFn: fetchViolation,
        refetchInterval: 5000,
        refetchOnWindowFocus: false
    });
};
