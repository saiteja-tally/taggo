from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.contrib import admin

# Custom admin form to make email mandatory
class CustomUserAdminForm(forms.ModelForm):
    email = forms.EmailField(required=True, label="Email Address")

    class Meta:
        model = User
        fields = "__all__"

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if not email:
            raise forms.ValidationError("Email is required.")
        return email

# Custom UserAdmin
class CustomUserAdmin(UserAdmin):
    form = CustomUserAdminForm

# Unregister the default User admin
admin.site.unregister(User)

# Register the custom User admin
admin.site.register(User, CustomUserAdmin)
