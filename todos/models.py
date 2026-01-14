from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    telegram_id=models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.username
    

class TaskGroup(models.Model):
    
    name = models.CharField(max_length=400)
    created_at = models.DateTimeField(auto_now_add=True)
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
    
    class Meta:
        ordering=['-created_at']
        
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

class GroupInvites(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invites')
    group = models.ForeignKey(TaskGroup, on_delete=models.CASCADE)

class Todo(models.Model):
    
    class Status(models.IntegerChoices):
        TODO = 1, 'К выполнению'
        IN_PROGRESS = 2, 'В процессе'
        DONE = 3, 'Выполнено'
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    to_notify = models.BooleanField(default=False)
    creator = models.ForeignKey(
        User, 
        related_name= 'created_tasks', 
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    group = models.ForeignKey(TaskGroup, related_name='tasks', on_delete=models.CASCADE, null=True, blank=True)
    
    assignee = models.ForeignKey(
        User,
        related_name='assigned_tasks',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    status = models.IntegerField(
        choices=Status.choices,
        default=Status.TODO
    )
    
    def save(self, *args, **kwargs):
        if self.pk is not None:
            old_status = (
                Todo.objects.filter(pk=self.pk)
                .values_list('status', flat=True).first()
            )
        else: 
            old_status=None
            
        if self.status == self.Status.DONE and old_status != self.Status.DONE:
            self.completed_at = timezone.now()
            
        if self.status != self.Status.DONE and old_status == self.Status.DONE:
            self.completed_at = None
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['status', '-created_at','-completed_at']
    
    def __str__(self):
        if self.group:
            return f"[{self.group.name}] {self.title}"
        return self.title