/** Hooks for my friend list and my incoming and outgoing friend requests. */
import { useQuery } from "@tanstack/react-query";
import { fetchFriendRequests, fetchFriends, friendKeys } from "../api";

export function useFriends() {
  return useQuery({ queryKey: friendKeys.list(), queryFn: fetchFriends });
}

export function useFriendRequests() {
  return useQuery({ queryKey: friendKeys.requests(), queryFn: fetchFriendRequests });
}
