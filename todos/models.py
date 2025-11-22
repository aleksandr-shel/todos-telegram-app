from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    telegram_id=models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.username
    

class TaskGroup(models.Model):
    
    name = models.CharField(max_length=400)
    owner = models.ForeignKey(
        User,
        related_name='owned_groups',
        on_delete=models.CASCADE
    )
    members = models.ManyToManyField(
        User,
        through='GroupMembership',
        related_name='task_groups'
    )
    
    def __str__(self):
        return self.name

class GroupMembership(models.Model):
    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'
        
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(TaskGroup, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at= models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'group')
    
    def __str__(self):
        return f"{self.user} in {self.group} ({self.role})"

# Create your models here.
class Todo(models.Model):
    
    class Status(models.IntegerChoices):
        TODO = 1, 'To Do'
        IN_PROGRESS = 2, 'In Progress'
        DONE = 3, 'Done'
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    creator = models.ForeignKey(User, related_name= 'created_tasks', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    creator=models.ForeignKey(User, related_name='created_tasks', on_delete=models.CASCADE)
    
    group = models.ForeignKey(TaskGroup, related_name='tasks', on_delete=models.CASCADE, null=True, blank=True)
    
    assignee = models.ForeignKey(
        User,
        related_name='assigned_tasks',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    status = models.CharField(
        max_length=20, 
        choices=Status.choices,
        default=Status.TODO
    )
    
    class Meta:
        ordering = ['status', '-created_at']
    
    def __str__(self):
        if self.group:
            return f"[{self.group.name}] {self.title}"
        return self.title