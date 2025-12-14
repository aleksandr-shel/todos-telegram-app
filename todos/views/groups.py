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
from . import check_user_has_manage_permission

class GroupListCreateView(APIView):
    
    def get(self, request):
        groups = TaskGroup.objects.filter(
            Q(owner = request.user) | Q(members = request.user)
        ).distinct()
        
        serializer = TaskGroupSerializer(groups, many=True, context={"request":request})
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = TaskGroupSerializer(data=request.data, context={"request":request})
        if serializer.is_valid():
            task_group = serializer.save()
            return Response(TaskGroupSerializer(task_group, context={"request":request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class GroupDetailsView(APIView):
    
    def get_object(self, request, pk):
        group = get_object_or_404(TaskGroup, pk=pk)
        if not (group.owner_id == request.user.id or group.members.filter(id=request.user.id).exists()):
            return None
        return group
    def get(self, request, pk):
        group = self.get_object(request,pk)
        print(type(group))
        if group is None:
            return Response({"detail":"не найден"}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskGroupDetailsSerializer(group)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self,request,pk):
        group = self.get_object(request,pk)
        if group is None:
            return Response({"detail":"не найден"}, status=status.HTTP_404_NOT_FOUND)
        
        membership = group.memberships.filter(user = request.user).first()
        
        if membership.role not in [GroupMembership.Role.OWNER, GroupMembership.Role.ADMIN]:
            return Response({"detail":"Запрещено"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TaskGroupSerializer(group, data = request.data, partial=True)
        if serializer.is_valid():
            upd_group = serializer.save()
            return Response(TaskGroupSerializer(upd_group).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    def delete(self,request,pk):
        group = self.get_object(request,pk)
        if group is None:
            return Response({"detail":"не найден"}, status=status.HTTP_404_NOT_FOUND)
        
        if group.owner_id != request.user.id:
            return Response({"detail":"только владелец может удалить группу"}, status=status.HTTP_403_FORBIDDEN)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    