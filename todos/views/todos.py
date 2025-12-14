
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from ..models import Todo, TaskGroup
from ..serializers import TodoSerializer
from django.shortcuts import get_object_or_404



class TodoListCreateView(APIView):
    # get a list of todos
    def get(self, request):
        list = Todo.objects.filter(creator=request.user)
        serializer = TodoSerializer(list, many=True)
        return Response(serializer.data)
    
    # create todo
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
        raise PermissionDenied("Нет разрешения к этой задаче")
    
    
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