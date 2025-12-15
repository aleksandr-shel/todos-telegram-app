from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ..serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth import login, logout

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
