import { useQuery } from "@tanstack/react-query";

const fetchViolation = async () => {
  const response = await fetch('http://127.0.0.1:5000/getUsers');

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetUser = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: fetchViolation,
        refetchInterval: 5000,
        refetchOnWindowFocus: false
    });
};
