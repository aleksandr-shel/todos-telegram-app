from django.urls import path, re_path
from .views import TodoListCreateView, TodoDetailsView, index, groups_page, LoginView, RegisterView, LogoutView, GetUserView, GroupListCreateView, GroupDetailsView
from django.views.generic import TemplateView

urlpatterns = [
    path("api/todos/", TodoListCreateView.as_view()),
    path("api/todos/<int:pk>", TodoDetailsView.as_view()),
    path("api/groups/", GroupListCreateView.as_view()),
    path("api/groups/<int:pk>", GroupDetailsView.as_view()),
    path("api/account/login", LoginView.as_view()),
    path("api/account/register", RegisterView.as_view()),
    path("api/account/getuser", GetUserView.as_view()),
    path("api/account/logout", LogoutView.as_view()),
    path("login", TemplateView.as_view(template_name='login.html'), name='login-page'),
    path("register", TemplateView.as_view(template_name='register.html'), name='register-page'),
    path("groups", groups_page),
    path("", index)
]