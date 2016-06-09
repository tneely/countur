from django import template

register = template.Library()

@register.simple_tag(name='get_latest', takes_context=True)
def get_latest(context, counter_id):
	counter = "counter"+str(counter_id)
	if counter in context:
			return context[counter]
	return 1