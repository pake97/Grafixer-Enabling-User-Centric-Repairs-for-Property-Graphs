import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveUser(onSuccess?: () => void) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (userData: { username: string;  }) => {
            console.log("remocing", userData)
            const response = await fetch("http://127.0.0.1:5000/removeUser", {
                method:"POST", // PUT for update, POST for create
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error("Failed to process request");
            }
            return response.json();
        },
        onSuccess: (data) => {
            // Invalidate cache to update user list after mutation
            queryClient.invalidateQueries({ queryKey: ["users"] });

            // Call the user-provided success function (if provided)
            if (onSuccess) {
                onSuccess();
            }
        },
        onError: (error) => {
            console.error("Mutation error:", error);
        },
    });

    return {
        removeUserMutation: mutation.mutate,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
    };
}
