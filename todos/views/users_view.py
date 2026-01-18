from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import User
from rest_framework.pagination import PageNumberPagination


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50



class UsersView(APIView):
    pagination_class = UserPagination
    # search users
    def get(self, request):
        q=request.query_params.get('q','')
        
        queryset = (
            User.objects.filter(username__icontains=q)
            .order_by('id')
            .values('id', 'username', 'telegram_id')
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        return paginator.get_paginated_response(page)
    
    # creates fake users. naive approach
    def post(self, request):
        usernames = [
            'alex',
            'sasha',
            'aleksandr'
        ]
        for username in usernames:
            User.objects.create_user(username, '', 'test1234')
            
        return Response('created')