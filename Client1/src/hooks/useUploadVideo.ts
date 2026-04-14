import { useMutation } from "@tanstack/react-query";
import { createVideo } from "../api/videos";
import type { UploadVideoPayload, UploadVideoResponse } from "../types/video";

type UploadVideoOptions = {
  onSuccess?: (response: UploadVideoResponse) => void;
};

export function useUploadVideo() {
  const mutation = useMutation<
    UploadVideoResponse,
    Error,
    { payload: UploadVideoPayload; options?: UploadVideoOptions }
  >({
    mutationFn: async ({ payload }) => createVideo(payload),
  });

  const uploadVideo = async (
    payload: UploadVideoPayload,
    options?: UploadVideoOptions,
  ) => {
    const response = await mutation.mutateAsync({ payload, options });
    options?.onSuccess?.(response);
    return response;
  };

  return {
    uploadVideo,
    isUploading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  } as const;
}
