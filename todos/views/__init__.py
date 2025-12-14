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

def index(request):
    if not request.user.is_authenticated:
        print('not authenticated')
        return redirect('login-page')
    return render(request, "index.html")

def groups_page(request):
    if not request.user.is_authenticated:
        print('not authenticated')
        return redirect('login-page')
    return render(request, "groups.html")

def page404(request):
    
    return render(request, '404.html', status=404)

    
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


