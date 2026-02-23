from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import GroupApplication, GroupInvite, TaskGroup, User
from ..serializers.application_serializer import ApplicationSerializer
from ..serializers.invite_serializer import  InviteSerializer
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.pagination import PageNumberPagination

class Pagination(PageNumberPagination):
    page_size=10
    page_size_query_param = 'page_size'
    max_page_size = 50


class InviteView(APIView):
    pagination_class = Pagination
    # get invites of the user
    def get(self,request):
        paginator = self.pagination_class()
        queryset = GroupInvite.objects.all()
        page = paginator.paginate_queryset(queryset, request)
        serializer = InviteSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    # invite a user
    def post(self, request):
        group_id = request.data.get('group_id')
        user_id = request.data.get('user_id')
        if group_id is None:
            return Response({"details": 'Group id is not given'}, status=status.HTTP_400_BAD_REQUEST)

        if user_id is None:
            return Response({"details": 'User id is not given'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            group = get_object_or_404(TaskGroup, pk = group_id)
            user = get_object_or_404(User, pk = user_id)
        except Exception as e:
            return Response(str(e), status=status.HTTP_404_NOT_FOUND)

        try:
            invite = GroupInvite.objects.create(group=group, user=user)
            return Response(InviteSerializer(invite).data)
        except IntegrityError:
            return Response({"details":"invite уже существует"}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InviteDetailsView(APIView):
    def get(self, request,pk):
        pass
    
    
class ApplicationView(APIView):
    pagination_class = Pagination
    # get applications of the group
    def get(self,request):
        q = request.query_params.get('q')
        paginator = self.pagination_class()
        
        # get applications for the user
        if q == 'user':
            print(q)
        # get applications for the group
        
        # get all applications
        
        queryset = GroupApplication.objects.all()
        page = paginator.paginate_queryset(queryset, request)
        
        serializer = ApplicationSerializer(page, many=True)        
        
        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        group_id = request.data.get('group_id')
        if group_id is None:
            return Response({"details": 'Group id is not given'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            group = get_object_or_404(TaskGroup, pk = group_id)
        except:
            return Response({"details": 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            application = GroupApplication.objects.create(group=group, user=request.user)
            return Response(ApplicationSerializer(application).data)
        except IntegrityError:
            return Response(
                {"details":"application уже существует"},
                status=status.HTTP_409_CONFLICT
            )
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ApplicationDetailsView(APIView):
    def put(self, request,pk):
        application = get_object_or_404(GroupApplication, pk=pk)
        if application is None:
            return Response({"details": "application не найдено"}, status=status.HTTP_404_NOT_FOUND)
        print(application)
        return Response('updating')

    def delete(self, request, pk):
        application = get_object_or_404(GroupApplication, pk=pk)
        if application is None:
            return Response({"details":"application не найдено"}, status=status.HTTP_404_NOT_FOUND)
        application.delete()

        return Response('deleting')