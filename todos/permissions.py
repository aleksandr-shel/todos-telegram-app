from rest_framework.permissions import BasePermission
from .models import TaskGroup, GroupMembership, Todo

class IsGroupMember(BasePermission):
    # если пользователь в группе? 
    def has_object_permission(self, request, view, obj):
        group = getattr(obj, "group", None)
        if not group:
            return obj.creator_id == request.user.id
        return group.members.filter(id=request.user.id).exists()


class IsGroupOwnerOrAdmin(BasePermission):
    # Только владелец группы или админы могут изменять группу
    def has_object_permission(self, request, view, obj):
        group = obj if isinstance(obj, TaskGroup) else obj.group
        membership = group.memberships.filter(user=request.user).first()
        if not membership:
            return False
        return membership.role in [GroupMembership.Role.OWNER, GroupMembership.Role.ADMIN]
