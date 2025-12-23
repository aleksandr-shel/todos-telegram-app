from django.shortcuts import render, redirect
from rest_framework.exceptions import PermissionDenied
from ..models import GroupMembership


def index(request):
    if not request.user.is_authenticated:
        print('not authenticated')
        return redirect('login-page')
    return render(request, "index.html")

def groups_page(request):
    if not request.user.is_authenticated:
        print('not authenticated')
        return redirect('login-page')
    return render(request, "groups.html")

def create_group_page(request):
    
    return render(request, 'groups/create.html')

def page404(request):
    
    return render(request, '404.html', status=404)

