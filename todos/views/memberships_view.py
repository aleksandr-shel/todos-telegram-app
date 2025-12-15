from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied
from ..models import Todo, TaskGroup, GroupMembership, User
from ..serializers import TodoSerializer, TaskGroupSerializer, RegisterSerializer, LoginSerializer, GroupMembershipSerializer, TaskGroupDetailsSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import login, logout
from django.db.models import Q
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist

def check_user_has_manage_permission(group, user):
    if not user.is_authenticated:
        raise PermissionDenied('неавторизован')
    
    if group.owner_id == user.id:
        return True
    
    is_allowed = GroupMembership.objects.filter(
        group = group,
        user = user,
        role__in=[
            GroupMembership.Role.ADMIN,
            GroupMembership.Role.OWNER
        ]
    ).exists()
    
    if not is_allowed:
        raise PermissionDenied("Нет разрешения на изменение группы")
    return True

class GroupMembershipListCreateView(APIView):
    # get all members for test
    def get(self, request):
        # if 'q' in request.GET:
        #     # реализация поиска-не сделано
        #     q = request.GET.get('q','')
                
        #     memberships = GroupMembership.objects.filter(user__username__icontains = q)
        #     ser = GroupMembershipSerializer(memberships, many=True)
        #     return Response(ser.data)
        # else:
        memberships = GroupMembership.objects.all()
        ser = GroupMembershipSerializer(memberships, many=True)
        return Response(ser.data)
        
    
    # add member to the group
    def post(self, request):
        
        data = request.data 
        user_id = data.get('user_id',None)
        group_id = data.get('group_id',None)
        if user_id is None and group_id is None:
            return Response({'details':'нет user_id или group_id'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            group = get_object_or_404(TaskGroup, pk = group_id)
            check_user_has_manage_permission(group, request.user)
            user = get_object_or_404(User, pk = user_id)
        except ObjectDoesNotExist:
            return Response({'details': 'User or Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            new_member = GroupMembership.objects.create(group=group, user=user)
            return Response(GroupMembershipSerializer(new_member).data)
        except IntegrityError:
            return Response(
                {"details":"membership уже существует с таким user_id и group_id"},
                status = status.HTTP_409_CONFLICT
            )
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        

class GroupMembershipDetailsView(APIView):
    # get group members
    # pk is group_id
    def get(self, request, pk):
        members = GroupMembership.objects.filter(group_id = pk)
        print(members)
        serializer = GroupMembershipSerializer(members, many=True)
        return Response(serializer.data)

    # update group member
    # pk is group membership id
    def patch(self, request, pk):
        membership = get_object_or_404(GroupMembership, pk=pk)
        check_user_has_manage_permission(membership.group, request.user)
        serializer = GroupMembershipSerializer(membership, data=request.data, partial=True)
        if serializer.is_valid():
            membership = serializer.save()
            return Response(GroupMembershipSerializer(membership).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # kick user from the group
    # pk is group membership id
    def delete(self, request, pk):
        membership = get_object_or_404(GroupMembership, pk = pk)
        check_user_has_manage_permission(membership.group, request.user)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    