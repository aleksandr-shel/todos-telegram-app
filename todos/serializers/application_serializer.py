from rest_framework import serializers
from ..models import GroupApplication
from ..serializers.serializers import UserPublicSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    class Meta:
        model = GroupApplication
        fields = '__all__'
        read_only_fields = ['id', 'created_at']