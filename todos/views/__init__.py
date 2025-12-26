from django.shortcuts import render, redirect
from rest_framework.exceptions import PermissionDenied
from ..models import GroupMembership
from django.contrib.auth.decorators import login_required

def index(request):
    if not request.user.is_authenticated:
        print('not authenticated')
        return redirect('login-page')
    return render(request, "index.html")

def groups_page(request):
    if not request.user.is_authenticated:
        print('not authenticated')
        return redirect('login-page')
    return render(request, "groups/groups.html")

@login_required(login_url="login-page")
def group_page(request, pk):
    return render(request, "groups/group.html")

@login_required(login_url="login-page")
def create_group_page(request):
    
    return render(request, 'groups/create.html')

def page404(request):
    
    return render(request, '404.html', status=404)

