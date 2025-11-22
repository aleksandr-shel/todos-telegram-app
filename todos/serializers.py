from rest_framework import serializers
from .models import Todo, User
from django.contrib.auth import authenticate

class TodoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Todo
        fields = ['id', 'title', 'description','due_date', 'completed_at', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
        

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