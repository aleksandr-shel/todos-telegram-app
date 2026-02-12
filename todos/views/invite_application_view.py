from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import GroupApplication, GroupInvite, TaskGroup
from ..serializers.application_serializer import ApplicationSerializer, InviteSerializer
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
    
    # get invites of the user
    def get(self,request):
        return Response("test")
    
    def post(self, request):
        pass
    
    
class ApplicationView(APIView):
    
    # get applications of the group
    def get(self,request):
        q = request.query_params.get('q', '')
        print(q)
        # get applications for the user
        
        
        # get applications for the group
        
        # get all applications
        applications = GroupApplication.objects.all()
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)
    
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
            
    def delete(self, request):
        
        pk = request.data.get('q')
        
        
        
        return Response('deleting')
    