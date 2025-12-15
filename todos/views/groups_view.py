from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import TaskGroup, GroupMembership, Todo
from ..serializers import TaskGroupSerializer, TaskGroupDetailsSerializer, TodoSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Q

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

class GroupTasksView(APIView):
    # pk is group id 
    def get(self, request, pk):
        tasks = Todo.objects.filter(group_id = pk)
        serializer = TodoSerializer(tasks, many=True)
        return Response(serializer.data)