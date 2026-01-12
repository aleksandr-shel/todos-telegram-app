from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.utils import timezone
from ..models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def connect_telegram(request):
    user_id = request.data.get('user_id')
    telegram_id = request.data.get('telegram_id')
    user = User.objects.get(id=user_id)
    user.telegram_id = telegram_id
    user.save()
    return Response({"details":"Telegram аккаунт был привязан"},status=status.HTTP_200_OK)

@api_view(['GET','POST'])
@permission_classes([AllowAny])
def test(request):

    print(timezone.now())
    return Response(timezone.now())


def old_fragile_endpoint(request):
    user_id = request.data.get('user_id')
    telegram_id = request.data.get('telegram_id')
    user = User.objects.get(id=user_id)
    user.telegram_id = telegram_id
    user.save()
    return Response({"detail":"Telegram аккаунт был привязан"},status=status.HTTP_200_OK)