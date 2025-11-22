from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Todo
from .serializers import TodoSerializer, RegisterSerializer, LoginSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import login, logout


def index(request):
    if not request.user.is_authenticated:
        print('not authenticated')
        return redirect('login-page')
    return render(request, "index.html")

def page404(request):
    
    return render(request, '404.html', status=404)

class TodoListCreateView(APIView):
    
    def get(self, request):
        list = Todo.objects.all().order_by('-created_at')
        serializer = TodoSerializer(list, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TodoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status = status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    
    
class TodoDetailsView(APIView):
    
    def get(self, request, pk):
        todo = get_object_or_404(Todo, pk = pk)
        serializer = TodoSerializer(todo)
        print(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    def put(self, request, pk):
        todo = get_object_or_404(Todo, pk = pk)
        serializer = TodoSerializer(todo, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_200_OK)
    
    def patch(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        serializer = TodoSerializer(todo, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        todo = get_object_or_404(Todo, pk = pk)
        todo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

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


