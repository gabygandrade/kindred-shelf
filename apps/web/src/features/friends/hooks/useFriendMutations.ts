/**
 * Hooks for sending, accepting and removing friends and for invite links. Each
 * one refreshes the shelves too, since friendships decide whose books I can see.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shelfKeys } from "../../shelf/api";
import {
  acceptFriend,
  createFriendInvite,
  friendKeys,
  redeemFriendInvite,
  removeFriend,
  sendFriendRequest,
} from "../api";

/** Any change to a friendship can change whose shelves I may see, so refresh both. */
function useInvalidateFriendships() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: friendKeys.all });
    void queryClient.invalidateQueries({ queryKey: shelfKeys.all });
  };
}

export function useSendFriendRequest() {
  const onSuccess = useInvalidateFriendships();
  return useMutation({ mutationFn: sendFriendRequest, onSuccess });
}

export function useAcceptFriend() {
  const onSuccess = useInvalidateFriendships();
  return useMutation({ mutationFn: acceptFriend, onSuccess });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateFriendships();
  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      // Drop cached friend shelves right away rather than showing them until the refetch.
      queryClient.removeQueries({ queryKey: [...shelfKeys.all, "user"] });
      invalidate();
    },
  });
}

export function useCreateFriendInvite() {
  return useMutation({ mutationFn: createFriendInvite });
}

export function useRedeemFriendInvite() {
  const onSuccess = useInvalidateFriendships();
  return useMutation({ mutationFn: redeemFriendInvite, onSuccess });
}
