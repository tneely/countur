from allauth.account.adapter import *
from django.core.mail import send_mail

# Modify existing adapter
class CounturAdapter(DefaultAccountAdapter):

    # Bypasses render_mail by using send_mail instead of EmailMessage
    def send_mail(self, template_prefix, email, context):
        """
        Renders an e-mail to `email`.  `template_prefix` identifies the
        e-mail that is to be sent, e.g. "account/email/email_confirmation"
        """
        subject = render_to_string('{0}_subject.txt'.format(template_prefix),
                                   context)
        # remove superfluous line breaks
        subject = " ".join(subject.splitlines()).strip()
        subject = super(CounturAdapter, self).format_email_subject(subject)

        from_email = super(CounturAdapter, self).get_from_email()
        html_message = None

        bodies = {}
        for ext in ['html', 'txt']:
            try:
                template_name = '{0}_message.{1}'.format(template_prefix, ext)
                bodies[ext] = render_to_string(template_name,
                                               context).strip()
            except TemplateDoesNotExist:
                if ext == 'txt' and not bodies:
                    # We need at least one body
                    raise
        if 'txt' in bodies:
            message = bodies['txt']
            if 'html' in bodies:
                html_message = bodies['html']
        else:
            html_message = bodies['html']

        send_mail(subject,
                message,
                from_email,
                [email],
                html_message=html_message)