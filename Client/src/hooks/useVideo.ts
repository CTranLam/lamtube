import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ApiRequestError,
  getVideoById,
  subscribeChannel,
  unsubscribeChannel,
} from "../api/videos";
import type { VideoDetail } from "../types/video";
import { useAuth } from "./useAuth";

type ToggleSubscribeResult = {
  ok: boolean;
  requiresLogin?: boolean;
};

export function useVideo(id: string | undefined) {
  const { user, signOut } = useAuth();
  const query = useQuery<VideoDetail | undefined>({
    queryKey: ["video", id],
    queryFn: () => getVideoById(id),
    enabled: !!id,
  });

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [overrideSubscribed, setOverrideSubscribed] = useState<boolean | null>(
    null,
  );
  const [overrideSubscriberCount, setOverrideSubscriberCount] = useState<
    number | null
  >(null);

  const video = query.data;
  const isSubscribed = overrideSubscribed ?? Boolean(video?.isSubscribed);
  const subscriberCount =
    overrideSubscriberCount ?? (Number(video?.subscriberCount) || 0);

  useEffect(() => {
    setOverrideSubscribed(null);
    setOverrideSubscriberCount(null);
    setSubscribeError(null);
  }, [id, video?.id, video?.isSubscribed, video?.subscriberCount]);

  const clearSubscribeError = useCallback(() => {
    setSubscribeError(null);
  }, []);

  const toggleSubscribe =
    useCallback(async (): Promise<ToggleSubscribeResult> => {
      if (!video?.channelId) {
        setSubscribeError("Không tìm thấy thông tin kênh để đăng ký.");
        return { ok: false };
      }

      if (!user) {
        setSubscribeError("Vui lòng đăng nhập để đăng ký kênh.");
        return { ok: false, requiresLogin: true };
      }

      if (isSubscribing) {
        return { ok: false };
      }

      setIsSubscribing(true);
      setSubscribeError(null);

      const previousSubscribed = isSubscribed;
      const previousCount = subscriberCount;
      const nextSubscribed = !previousSubscribed;
      const delta = nextSubscribed ? 1 : -1;
      const nextCount = Math.max(0, previousCount + delta);

      setOverrideSubscribed(nextSubscribed);
      setOverrideSubscriberCount(nextCount);

      try {
        const summary = nextSubscribed
          ? await subscribeChannel(video.channelId)
          : await unsubscribeChannel(video.channelId);

        setOverrideSubscribed(summary.isSubscribed);
        setOverrideSubscriberCount(summary.subscriberCount);
        return { ok: true };
      } catch (error) {
        setOverrideSubscribed(previousSubscribed);
        setOverrideSubscriberCount(previousCount);

        const message =
          error instanceof Error
            ? error.message
            : "Không thể cập nhật đăng ký.";
        setSubscribeError(message);

        if (error instanceof ApiRequestError && error.status === 401) {
          signOut();
          return { ok: false, requiresLogin: true };
        }
        return { ok: false };
      } finally {
        setIsSubscribing(false);
      }
    }, [
      isSubscribed,
      isSubscribing,
      signOut,
      subscriberCount,
      user,
      video?.channelId,
    ]);

  return {
    ...query,
    video,
    isSubscribed,
    subscriberCount,
    isSubscribing,
    subscribeError,
    clearSubscribeError,
    toggleSubscribe,
  };
}
