from django.shortcuts import render
from django.shortcuts import redirect
from allauth.account.views import *
from main.forms import ContactForm
from django.template.loader import get_template
from django.core.mail import send_mail
from django.template import Context
from django.dispatch import Signal
from django.contrib.auth.decorators import login_required

def contact(request):
    form = ContactForm

    # Manage submission
    if request.method == 'POST':
        form = form(data=request.POST)

        if form.is_valid():
            contact_name = form.cleaned_data['contact_name']
            contact_email = form.cleaned_data['contact_email']
            form_content = form.cleaned_data['content']

            # Email the profile with the
            # contact information
            template = get_template('contact_template.txt')
            context = Context({
                'contact_name': contact_name,
                'contact_email': contact_email,
                'form_content': form_content,
            })
            content = template.render(context)

            send_mail("New Countur Contact",
                content,
                "no-reply@Countur.com",
                ["tneely.send@gmail.com"])

            get_adapter(request).add_message(
                request,
                messages.SUCCESS,
                'main/messages/message_sent.txt')

            Signal().send(sender=request.user.__class__,
                request=request,
                user=request.user)

            return redirect('contact')

    return render(request, 'main/contact.html', {'form': form})

def about(request):
    return render(request, 'main/about.html')

class EmailVerify(EmailView):
    # Override post to allow for verification checking before resending verification
    def _action_send(self, request, *args, **kwargs):
        email = request.POST["email"]
        try:
            email_address = EmailAddress.objects.get(
                user=request.user,
                email=email,
            )
            if email_address.verified:
                get_adapter(request).add_message(
                    request,
                    messages.ERROR,
                    'main/messages/'
                    'message_already_verified.txt')
            else:
                get_adapter(request).add_message(
                    request,
                    messages.INFO,
                    'account/messages/'
                    'email_confirmation_sent.txt',
                    {'email': email})
                email_address.send_confirmation(request)
                return HttpResponseRedirect(self.get_success_url())
        except EmailAddress.DoesNotExist:
            pass

class JointLoginSignupView(LoginView):
    form_class = LoginForm
    signup_form  = SignupForm
    def __init__(self, **kwargs):
        super(JointLoginSignupView, self).__init__(*kwargs)

    def get_context_data(self, **kwargs):
        ret = super(JointLoginSignupView, self).get_context_data(**kwargs)
        ret['signupform'] = get_form_class(app_settings.FORMS, 'signup', self.signup_form)
        return ret

class JointSignupLoginView(SignupView):
    form_class = SignupForm
    signup_form  = SignupForm
    login_form  = LoginForm
    def __init__(self, **kwargs):
        super(JointSignupLoginView, self).__init__(*kwargs)

    def get_context_data(self, **kwargs):
        ret = super(JointSignupLoginView, self).get_context_data(**kwargs)
        ret['loginform'] = get_form_class(app_settings.FORMS, 'login', self.login_form)
        return ret

@login_required
def manage(request):
    return render(request, 'account/manage.html')

class DeleteView(TemplateResponseMixin, View):
    template_name = "account/delete_confirm.html"
    redirect_field_name = "next"

    def get(self, *args, **kwargs):
        if not self.request.user.is_authenticated():
            return redirect(self.get_redirect_url())
        ctx = self.get_context_data()
        return self.render_to_response(ctx)

    def post(self, *args, **kwargs):
        url = self.get_redirect_url()
        if self.request.user.is_authenticated():
            self.delete()
        return redirect(url)

    def delete(self):
        self.request.user.delete()

    def get_context_data(self, **kwargs):
        ctx = kwargs
        redirect_field_value = get_request_param(self.request,
                                                 self.redirect_field_name)
        ctx.update({
            "redirect_field_name": self.redirect_field_name,
            "redirect_field_value": redirect_field_value})
        return ctx

    def get_redirect_url(self):
        return (
            get_next_redirect_url(
                self.request,
                self.redirect_field_name) or get_adapter(
                    self.request).get_logout_redirect_url(
                        self.request))

delete = login_required(DeleteView.as_view())
login = JointLoginSignupView.as_view()
signup = JointSignupLoginView.as_view()
email = login_required(EmailVerify.as_view())
