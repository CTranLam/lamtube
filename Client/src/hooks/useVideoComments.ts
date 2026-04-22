import { useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { ApiRequestError } from "../api/videos";
import {
  createVideoComment,
  deleteVideoComment,
  getVideoComments,
  updateVideoComment,
} from "../api/comments";
import type { VideoComment, VideoCommentListResult } from "../types/comment";

const COMMENT_PAGE_SIZE = 10;

type ActionResult = {
  ok: boolean;
  error?: string;
  requiresLogin?: boolean;
};

function updateTotalElements(
  pages: VideoCommentListResult[],
  delta: number,
): VideoCommentListResult[] {
  return pages.map((page) => ({
    ...page,
    totalElements: Math.max(0, page.totalElements + delta),
  }));
}

function collectDescendantIds(comments: VideoComment[], rootId: number): Set<number> {
  const ids = new Set<number>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const comment of comments) {
      if (comment.parentId != null && ids.has(comment.parentId) && !ids.has(comment.id)) {
        ids.add(comment.id);
        changed = true;
      }
    }
  }

  return ids;
}

export function useVideoComments(videoId: number | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["video-comments", videoId ?? "unknown", COMMENT_PAGE_SIZE] as const;

  const query = useInfiniteQuery({
    queryKey,
    enabled: typeof videoId === "number" && videoId > 0,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getVideoComments(videoId as number, {
        page: Number(pageParam) || 0,
        size: COMMENT_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      if (lastPage.totalPages > 0) {
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      }
      return lastPage.items.length >= COMMENT_PAGE_SIZE ? nextPage : undefined;
    },
  });

  const comments = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const totalCount = useMemo(() => {
    if (!query.data?.pages.length) return 0;
    const fromApi = query.data.pages[0]?.totalElements ?? 0;
    return Math.max(fromApi, comments.length);
  }, [comments.length, query.data]);

  const createMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: number | null }) =>
      createVideoComment(videoId as number, {
        content,
        parentId,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateVideoComment(videoId as number, commentId, { content }),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteVideoComment(videoId as number, commentId),
  });

  const submitComment = async (
    content: string,
    options?: { parentId?: number | null },
  ): Promise<ActionResult> => {
    const trimmed = content.trim();
    if (!trimmed) {
      return {
        ok: false,
        error: "Nội dung bình luận không được để trống.",
      };
    }

    if (typeof videoId !== "number" || videoId <= 0) {
      return {
        ok: false,
        error: "Không tìm thấy video để gửi bình luận.",
      };
    }

    try {
      const created = await createMutation.mutateAsync({
        content: trimmed,
        parentId: options?.parentId ?? null,
      });

      queryClient.setQueryData<InfiniteData<VideoCommentListResult>>(queryKey, (old) => {
        if (!old || old.pages.length === 0) {
          return {
            pageParams: [0],
            pages: [
              {
                items: [created],
                page: 0,
                size: COMMENT_PAGE_SIZE,
                totalElements: 1,
                totalPages: 1,
              },
            ],
          };
        }

        const pages = old.pages.map((page, index) => {
          if (index === 0) {
            return {
              ...page,
              items: [created, ...page.items],
            };
          }
          return page;
        });

        return {
          ...old,
          pages: updateTotalElements(pages, 1),
        };
      });

      return { ok: true };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        return {
          ok: false,
          requiresLogin: true,
          error: error.message,
        };
      }

      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Không thể gửi bình luận.",
      };
    }
  };

  const editComment = async (commentId: number, content: string): Promise<ActionResult> => {
    const trimmed = content.trim();
    if (!trimmed) {
      return {
        ok: false,
        error: "Nội dung bình luận không được để trống.",
      };
    }

    try {
      const updated = await updateMutation.mutateAsync({
        commentId,
        content: trimmed,
      });

      queryClient.setQueryData<InfiniteData<VideoCommentListResult>>(queryKey, (old) => {
        if (!old) return old;

        const pages = old.pages.map((page) => ({
          ...page,
          items: page.items.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  content: updated.content || trimmed,
                  createdAt: updated.createdAt || comment.createdAt,
                }
              : comment,
          ),
        }));

        return {
          ...old,
          pages,
        };
      });

      return { ok: true };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        return {
          ok: false,
          requiresLogin: true,
          error: error.message,
        };
      }

      return {
        ok: false,
        error: error instanceof Error ? error.message : "Không thể sửa bình luận.",
      };
    }
  };

  const removeComment = async (commentId: number): Promise<ActionResult> => {
    try {
      await deleteMutation.mutateAsync(commentId);

      queryClient.setQueryData<InfiniteData<VideoCommentListResult>>(queryKey, (old) => {
        if (!old) return old;

        const allComments = old.pages.flatMap((page) => page.items);
        const deletedIds = collectDescendantIds(allComments, commentId);
        const removedCount = deletedIds.size;
        if (!removedCount) return old;

        const pages = old.pages.map((page) => ({
          ...page,
          items: page.items.filter((comment) => !deletedIds.has(comment.id)),
        }));

        return {
          ...old,
          pages: updateTotalElements(pages, -removedCount),
        };
      });

      return { ok: true };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        return {
          ok: false,
          requiresLogin: true,
          error: error.message,
        };
      }

      return {
        ok: false,
        error: error instanceof Error ? error.message : "Không thể xóa bình luận.",
      };
    }
  };

  const loadMore = async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    await query.fetchNextPage();
  };

  return {
    comments,
    totalCount,
    hasLoaded: query.isFetched,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error.message : null,
    hasMore: Boolean(query.hasNextPage),
    isLoadingMore: query.isFetchingNextPage,
    isSubmitting: createMutation.isPending,
    isEditing: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    loadMore,
    refetch: query.refetch,
    submitComment,
    editComment,
    removeComment,
  };
}
