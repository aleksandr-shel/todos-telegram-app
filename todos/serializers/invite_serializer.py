from rest_framework import serializers
from ..models import GroupInvite


class InviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupInvite
        fields = '__all__'
        read_only_fields = ['id', 'created_at']