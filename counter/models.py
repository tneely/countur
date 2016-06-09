from django.db import models
from django.conf import settings
from django.utils import timezone

class Counter(models.Model):
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='counters', on_delete = models.CASCADE)
	name = models.CharField(max_length = 50)
	order = models.IntegerField()
	width = models.IntegerField()
	height = models.IntegerField()
	value = models.IntegerField()

	def __str__(self):
		return self.name

class Count(models.Model):
	counter = models.ForeignKey('Counter', on_delete = models.CASCADE)
	value = models.IntegerField()
	created = models.DateTimeField(editable=False)

	def save(self, *args, **kwargs):
		''' Only save date for first save '''
		if not self.id:
			self.created = timezone.now()
		return super(Count, self).save(*args, **kwargs)

	def __str__(self):
		return str(self.value)