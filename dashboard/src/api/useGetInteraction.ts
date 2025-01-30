import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getInteractions');

  if (!response.ok) {
    throw new Error(`Failed to fetch interactions: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetInteraction = () => {
    return useQuery({
        queryKey: ["interactions"],
        queryFn: fetchViolation,
        refetchInterval: 5000,
        refetchOnWindowFocus: false
    });
};
