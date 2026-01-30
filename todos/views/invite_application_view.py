from rest_framework.views import APIView
from rest_framework.response import Response

class InviteView(APIView):
    
    # get invites of the user
    def get(self,request):
        return Response("test")
    
    def post(self, request):
        pass
    
    
class ApplicationView(APIView):
    
    # get applications of the group
    def get(self,request):
        return Response("test")
    