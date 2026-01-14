from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import User

class UsersView(APIView):
    
    # search users
    def get(self, request):
        q=request.query_params.get('q','')
        users=User.objects.filter(username__icontains=q).values('id','username','telegram_id')[:10]
        return Response(users)