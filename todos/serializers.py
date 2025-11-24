from rest_framework import serializers
from .models import Todo, User, TaskGroup, GroupMembership
from django.contrib.auth import authenticate

    
class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields = ['id', 'username', 'telegram_id']
        
class GroupMembershipSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    user_id=serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    class Meta:
        model = GroupMembership
        fields = ["id", "user", "user_id", "group", "role", "joined_at"]
        read_only_fields = ["id", "joined_at"]


class TaskGroupSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    members =  UserPublicSerializer(read_only=True, many=True)
    memberships = GroupMembershipSerializer(read_only=True, many=True)
    class Meta:
        model = TaskGroup
        fields = [
            "id", "name", "owner", "members", "memberships"
        ]
        read_only_fields = ["id", "owner"]

    def create(self, validated_data):
        request = self.context['request']
        group = TaskGroup.objects.create(owner = request.user, **validated_data)
        GroupMembership.objects.create(
            group = group, user = request.user, role = GroupMembership.Role.OWNER
        )
        return group
    
class TodoSerializer(serializers.ModelSerializer):
    creator = UserPublicSerializer(read_only=True)
    class Meta:
        model = Todo
        fields = [
            'id', 'title', 'description', 'creator',
            'created_at', 'due_date', 'completed_at',
            'group', 'assignee', 'status'
        ]
        read_only_fields = ['id', 'creator', 'created_at']
    
    # def validate_assignee(self, user):
    #     group = self.instance.group if self.instance else None
    #     if group and not group.members.filter(pk=user.pk).exists():
    #         raise serializers.ValidationError("User is not a member of this group.")
    #     return user

class RegisterSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['username', 'password']
    
    def create(self, validated_data):
        user = User(
            username = validated_data['username'],
            email = validated_data.get('email','')
        )
        
        user.set_password(validated_data['password'])
        user.save()
        return user        
    
class UpdateTelegramIdSerializer(serializers.ModelSerializer):
    class Meta:
        model= User
        fields = ['telegram_id']
        extra_kwargs = {
            'telegram_id':{'required':True}
        }
    
class LoginSerializer(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )
        if not user:
            raise serializers.ValidationError('invalid credentials')
        
        data['user']=user
        return data