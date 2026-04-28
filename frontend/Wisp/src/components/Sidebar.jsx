import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatInviteStore } from "../store/useChatInviteStore";
import { useGroupStore } from "../store/useGroupStore";
import UserSearchBar from "./UserSearchBar";
import CreateGroupModal from "./CreateGroupModal";
import GroupDetailsModal from "./GroupDetailsModal";
import {
  MessageSquare,
  Users,
  Mail,
  Plus,
  Check,
  X,
  Info,
  Search,
  Cloud,
  BookUser,
} from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, typingUsers, unreadCounts } =
    useChatStore();
  const {
    pendingInvites,
    sentInvites,
    getPendingInvites,
    getSentInvites,
    acceptChatInvite,
    rejectChatInvite,
    cancelChatInvite,
    subscribeToInvites,
    unsubscribeFromInvites,
    isLoading: isInvitesLoading,
  } = useChatInviteStore();
  const {
    groups,
    getUserGroups,
    setSelectedGroup,
    selectedGroup,
    isGroupsLoading,
  } = useGroupStore();
  const { onlineUsers, authUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState("chats");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState(null);
  const hasFetchedRef = useRef(false);

  // Single centralized data fetch
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    getUsers();
    getUserGroups();
    getPendingInvites();
    getSentInvites();
    subscribeToInvites();

    return () => unsubscribeFromInvites();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedGroup(null);
    setSelectedUser(user);
  };

  const handleSelectGroup = (group) => {
    setSelectedUser(null);
    setSelectedGroup(group);
  };

  const handleAcceptInvite = async (inviteId) => {
    const success = await acceptChatInvite(inviteId);
    if (success) getUsers();
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const tabs = [
    { id: "chats", label: "Chats", icon: MessageSquare },
    { id: "contacts", label: "Contacts", icon: BookUser },
    { id: "groups", label: "Groups", icon: Users },
    {
      id: "invites",
      label: "Invites",
      icon: Mail,
      badge: pendingInvites.length,
    },
  ];

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center gap-2">
          <Cloud className="size-5 text-primary" />
          <span className="font-semibold text-lg hidden lg:block">
            WispCloud
          </span>
        </div>

        {/* Search */}
        <div className="mt-3 hidden lg:block">
          <UserSearchBar />
        </div>
        <div className="mt-2 lg:hidden flex justify-center">
          <Search className="size-5 text-base-content/40" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-base-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative
              ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-base-content/50 hover:text-base-content/80"
              }`}
          >
            <tab.icon className="size-4" />
            <span className="hidden lg:inline">{tab.label}</span>
            {tab.badge > 0 && (
              <span className="absolute top-1.5 right-2 lg:static bg-primary text-primary-content text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Chats Tab ── */}
        {activeTab === "chats" && (
          <div>
            {/* Online filter */}
            <div className="px-4 py-2 hidden lg:flex items-center justify-between">
              <button
                onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                className="flex items-center gap-2 text-xs text-base-content/60 hover:text-base-content/80 transition-colors"
              >
                <div className={`size-3 rounded-full transition-colors ${showOnlineOnly ? 'bg-green-500' : 'border-2 border-base-content/30'}`} />
                Online only
              </button>
              <span className="text-xs text-base-content/40">
                {onlineUsers.filter(id => id !== authUser?._id).length} online
              </span>
            </div>

            {isUsersLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton size-10 rounded-full shrink-0" />
                    <div className="hidden lg:block flex-1">
                      <div className="skeleton h-3 w-28 mb-1.5" />
                      <div className="skeleton h-2.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="size-10 mx-auto mb-2 text-base-content/20" />
                <p className="text-sm text-base-content/50 hidden lg:block">
                  {showOnlineOnly
                    ? "No users online"
                    : "No contacts yet"}
                </p>
                <p className="text-xs text-base-content/30 mt-1 hidden lg:block">
                  Search for users to start chatting
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-base-200
                    ${selectedUser?._id === user._id ? "bg-base-200" : ""}`}
                >
                  <div className="relative mx-auto lg:mx-0 shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-10 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {user.fullName}
                    </div>
                    <div className="text-xs text-base-content/40">
                      {typingUsers[user._id] ? (
                        <span className="text-primary italic">typing...</span>
                      ) : onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                  {unreadCounts[user._id] > 0 && (
                    <span className="bg-primary text-primary-content text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 shrink-0">
                      {unreadCounts[user._id]}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* ── Contacts Tab ── */}
        {activeTab === "contacts" && (
          <div>
            <div className="px-4 py-2 hidden lg:flex items-center justify-between">
              <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                All Contacts
              </span>
              <span className="text-xs text-base-content/40">
                {users.length}
              </span>
            </div>

            {isUsersLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton size-10 rounded-full shrink-0" />
                    <div className="hidden lg:block flex-1">
                      <div className="skeleton h-3 w-28 mb-1.5" />
                      <div className="skeleton h-2.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center">
                <BookUser className="size-10 mx-auto mb-2 text-base-content/20" />
                <p className="text-sm text-base-content/50 hidden lg:block">
                  No contacts yet
                </p>
                <p className="text-xs text-base-content/30 mt-1 hidden lg:block">
                  Search for users to add contacts
                </p>
              </div>
            ) : (
              [...users]
                .sort((a, b) => a.fullName.localeCompare(b.fullName))
                .map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-base-200
                      ${selectedUser?._id === user._id ? "bg-base-200" : ""}`}
                  >
                    <div className="relative mx-auto lg:mx-0 shrink-0">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="size-10 object-cover rounded-full"
                      />
                      {onlineUsers.includes(user._id) && (
                        <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
                      )}
                    </div>
                    <div className="hidden lg:block text-left min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-base-content/40">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        )}

        {/* ── Groups Tab ── */}
        {activeTab === "groups" && (
          <div>
            {/* Create group button */}
            <div className="p-3">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="w-full btn btn-sm btn-outline btn-primary gap-2"
              >
                <Plus className="size-4" />
                <span className="hidden lg:inline">Create Group</span>
              </button>
            </div>

            {isGroupsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton size-10 rounded-full shrink-0" />
                    <div className="hidden lg:block flex-1">
                      <div className="skeleton h-3 w-24 mb-1.5" />
                      <div className="skeleton h-2.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="size-10 mx-auto mb-2 text-base-content/20" />
                <p className="text-sm text-base-content/50 hidden lg:block">
                  No groups yet
                </p>
                <p className="text-xs text-base-content/30 mt-1 hidden lg:block">
                  Create a group to start collaborating
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group._id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-base-200
                    ${selectedGroup?._id === group._id ? "bg-base-200" : ""}`}
                >
                  <button
                    onClick={() => handleSelectGroup(group)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="shrink-0 mx-auto lg:mx-0">
                      {group.groupImage ? (
                        <img
                          src={group.groupImage}
                          alt={group.name}
                          className="size-10 object-cover rounded-full"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="size-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="hidden lg:block text-left min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {group.name}
                      </div>
                      <div className="text-xs text-base-content/40">
                        {group.stats?.totalMembers || 0} members
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGroupForDetails(group);
                      setShowGroupDetails(true);
                    }}
                    className="btn btn-ghost btn-xs btn-circle hidden lg:flex"
                  >
                    <Info className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Invites Tab ── */}
        {activeTab === "invites" && (
          <div>
            {isInvitesLoading ? (
              <div className="p-6 flex justify-center">
                <span className="loading loading-spinner loading-sm" />
              </div>
            ) : (
              <>
                {/* Pending (received) */}
                {pendingInvites.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                      Received
                    </div>
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite._id}
                        className="px-4 py-3 flex items-center gap-3"
                      >
                        <img
                          src={invite.sender?.profilePic || "/avatar.png"}
                          alt={invite.sender?.fullName}
                          className="size-9 rounded-full object-cover shrink-0 mx-auto lg:mx-0"
                        />
                        <div className="hidden lg:block flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {invite.sender?.fullName}
                          </div>
                          <div className="text-xs text-base-content/40 truncate">
                            @{invite.sender?.username}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleAcceptInvite(invite._id)}
                            className="btn btn-ghost btn-xs btn-circle text-success"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            onClick={() => rejectChatInvite(invite._id)}
                            className="btn btn-ghost btn-xs btn-circle text-error"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sent */}
                {sentInvites.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                      Sent
                    </div>
                    {sentInvites.map((invite) => (
                      <div
                        key={invite._id}
                        className="px-4 py-3 flex items-center gap-3"
                      >
                        <img
                          src={invite.receiver?.profilePic || "/avatar.png"}
                          alt={invite.receiver?.fullName}
                          className="size-9 rounded-full object-cover shrink-0 mx-auto lg:mx-0"
                        />
                        <div className="hidden lg:block flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {invite.receiver?.fullName}
                          </div>
                          <div className="text-xs text-base-content/40">
                            Pending
                          </div>
                        </div>
                        <button
                          onClick={() => cancelChatInvite(invite._id)}
                          className="btn btn-ghost btn-xs btn-circle text-error"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {pendingInvites.length === 0 && sentInvites.length === 0 && (
                  <div className="p-6 text-center">
                    <Mail className="size-10 mx-auto mb-2 text-base-content/20" />
                    <p className="text-sm text-base-content/50 hidden lg:block">
                      No invites
                    </p>
                    <p className="text-xs text-base-content/30 mt-1 hidden lg:block">
                      Search for users to send chat invites
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
      <GroupDetailsModal
        isOpen={showGroupDetails}
        onClose={() => {
          setShowGroupDetails(false);
          setSelectedGroupForDetails(null);
        }}
        group={selectedGroupForDetails}
      />
    </aside>
  );
};

export default Sidebar;
