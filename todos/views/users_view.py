from rest_framework.views import APIView
from rest_framework.response import Response


class UsersView(APIView):
    
    # search users
    def get(self, request):
        print(request.query_params)
        return Response("dsd")