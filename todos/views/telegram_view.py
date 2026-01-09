from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from ..models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def connect_telegram(request):
    print('connecting telegram')
    print(request.data)
    return Response('connecting telegram')