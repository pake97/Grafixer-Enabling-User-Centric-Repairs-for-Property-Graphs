import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getFree');

  if (!response.ok) {
    throw new Error(`Failed to fetch free: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetFree = () => {
    return useQuery({
        queryKey: ["free"],
        queryFn: fetchViolation,
        refetchInterval: 5000,
        refetchOnWindowFocus: false
    });
};
