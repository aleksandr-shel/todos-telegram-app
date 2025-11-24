from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied
from .models import Todo, TaskGroup, GroupMembership
from .serializers import TodoSerializer, TaskGroupSerializer, RegisterSerializer, LoginSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import login, logout
from django.db.models import Q


def index(request):
    if not request.user.is_authenticated:
        print('not authenticated')
        return redirect('login-page')
    return render(request, "index.html")

def page404(request):
    
    return render(request, '404.html', status=404)



class TodoListCreateView(APIView):
    
    def get(self, request):
        list = Todo.objects.filter(creator=request.user)
        serializer = TodoSerializer(list, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TodoSerializer(data=request.data)
        
        if serializer.is_valid():
            group_id = request.data.get('group_id','')
            if group_id:
                group = get_object_or_404(TaskGroup, pk = group_id)
                todo = serializer.save(creator=request.user, group = group)
                return Response(TodoSerializer(todo).data, status = status.HTTP_201_CREATED)
            todo = serializer.save(creator=request.user)
            return Response(TodoSerializer(todo).data, status = status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def check_todo_permission(todo,user):
    allowed = (
        todo.creator_id == user.id or
        todo.assignee_id == user.id or
        (todo.group and todo.group.members.filter(id=user.id).exists())
    )
    if not allowed:
        raise PermissionDenied("You don't have access to this task.")
    
    
class TodoDetailsView(APIView):
    
    def get(self, request, pk):
        todo = get_object_or_404(Todo, pk = pk)
        check_todo_permission(todo, request.user)
        
        serializer = TodoSerializer(todo)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    def put(self, request, pk):
        todo = get_object_or_404(Todo, pk = pk)
        check_todo_permission(todo, request.user)
        
        serializer = TodoSerializer(todo, data = request.data)
        if serializer.is_valid():
            todo = serializer.save()
            return Response(TodoSerializer(todo).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        check_todo_permission(todo, request.user)
        
        serializer = TodoSerializer(todo, data=request.data, partial=True)
        if serializer.is_valid():
            todo = serializer.save()
            return Response(TodoSerializer(todo).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        todo = get_object_or_404(Todo, pk = pk)
        check_todo_permission(todo, request.user)
        todo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

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
        if group is None:
            return Response({"detail":"не найден"}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskGroupSerializer(group)
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
    def get(self, request, group_id):
        
        return Response("group tasks")
    
    
class GroupMembershipListCreateView(APIView):
    def get(self, request):
        pass

class GroupMembershipDetailsView(APIView):
    def get(self, request, pk):
        pass

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data = request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({'detail':'logged in', 'username':user.username})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data = request.data)
        if serializer.is_valid():
            user =serializer.save()
            return Response({'id': user.id, 'username':user.username})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class GetUserView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "telegram_id": request.user.telegram_id
            })
        else:
            return Response({"detail":"Not logged in"}, status=401)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'detail': 'logged out'})


