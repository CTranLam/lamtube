import AddUserModal from "./AddUserModal";
import UserDetailsModal from "./UserDetailsModal";
import EditUserModal from "./EditUserModal";
import type { UserSummary } from "../../types/auth";

interface UserModalsProps {
  isAddOpen: boolean;
  onCloseAdd: () => void;
  isDetailsOpen: boolean;
  onCloseDetails: () => void;
  isEditOpen: boolean;
  onCloseEdit: () => void;
  selectedUser: UserSummary | null;
  roles: string[];
  rolesLoading: boolean;
  onRefresh: () => void | Promise<void>;
}

export const UserModals = ({
  isAddOpen,
  onCloseAdd,
  isDetailsOpen,
  onCloseDetails,
  isEditOpen,
  onCloseEdit,
  selectedUser,
  roles,
  rolesLoading,
  onRefresh,
}: UserModalsProps) => {
  return (
    <>
      <AddUserModal
        open={isAddOpen}
        onClose={onCloseAdd}
        onCreated={onRefresh}
      />

      <UserDetailsModal
        open={isDetailsOpen}
        onClose={onCloseDetails}
        userId={selectedUser?.userId ?? null}
      />

      <EditUserModal
        key={selectedUser?.userId}
        open={isEditOpen}
        onClose={onCloseEdit}
        user={selectedUser}
        roles={roles}
        rolesLoading={rolesLoading}
        onUpdated={onRefresh}
        onDeleted={onRefresh}
      />
    </>
  );
};
