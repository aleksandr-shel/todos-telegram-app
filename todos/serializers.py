from rest_framework import serializers
from .models import Todo, User, TaskGroup, GroupMembership
from django.contrib.auth import authenticate
from django.utils import timezone

    
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
    class Meta:
        model = TaskGroup
        fields = [
            "id", "name", "owner", "created_at"
        ]
        read_only_fields = ["id", "owner", "created_at"]

    def create(self, validated_data):
        request = self.context['request']
        group = TaskGroup.objects.create(owner = request.user, **validated_data)
        GroupMembership.objects.create(
            group = group, user = request.user, role = GroupMembership.Role.OWNER
        )
        return group
    
    
class TodoSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True, allow_blank=False)
    creator = UserPublicSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assignee_obj = UserPublicSerializer(source="assignee",read_only=True,allow_null = True)
    
    class Meta:
        model = Todo
        fields = [
            'id', 'title', 'description', 'creator',
            'created_at', 'due_date', 'completed_at',
            'group', 'assignee', 'status', 'status_display',
            "assignee_obj"
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'assignee_obj']
    def validate_due_date(self, value):
        if value is None:
            return None
        if value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value
    def validate_title(self,value:str) -> str:
        max_len = Todo._meta.get_field('title').max_length
        return value[:max_len]

class TaskGroupDetailsSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    # members =  UserPublicSerializer(read_only=True, many=True)
    # memberships = GroupMembershipSerializer(read_only=True, many=True)
    tasks = TodoSerializer(read_only=True, many=True)
    class Meta:
        model = TaskGroup
        fields = [
            "id", "name", "owner", "memberships", 'tasks'
        ]
        read_only_fields = ["id", "owner"]
        
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