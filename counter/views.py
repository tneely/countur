from counter.models import Counter, Count
from django.views.generic import ListView, DetailView
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils.html import escape
from django.utils import timezone
from dateutil.relativedelta import relativedelta
import json


class CounterListView(ListView):
    context_object_name = "counters"
    template_name = "counter/counters.html"

    def get_queryset(self):
        return Counter.objects.filter(
                                owner=self.request.user).order_by("order")

    def get_context_data(self, **kwargs):
        context = super(CounterListView, self).get_context_data(**kwargs)
        for counter in Counter.objects.all():
            counts = Count.objects.filter(counter=counter)
            if counts:
                count = counts.latest('created')
                context["counter"+str(counter.id)] = count.value
        return context


class CounterDetailView(DetailView):
    model = Counter
    template_name = "counter/count.html"

    def get_queryset(self):
        return Counter.objects.filter(owner=self.request.user)

    def get_context_data(self, **kwargs):
        context = super(CounterDetailView, self).get_context_data(**kwargs)
        counts = Count.objects.filter(
                counter=self.get_object().pk).order_by("-created")
        if len(counts) > 0:
            context['counts'] = counts[0].value
        else:
            context['counts'] = 1
        return context


def create(request, name, value):
    # Clean name and value
    name = escape(name).strip()
    value = int(value)
    # Get highest order
    latestCounter = Counter.objects.filter(owner=request.user)
    if latestCounter:
        order = latestCounter.latest('order').order + 1
    else:
        order = 0
    # Create counter
    counter = Counter(
        name=name,
        order=order,
        width=350,
        height=250,
        value=value)
    counter.owner = request.user
    # Save
    counter.save()
    # Return anything
    return HttpResponse(order)


def increment(request, counter_id, value):
    # Convert to ints
    counter_id = int(counter_id)
    value = int(value)
    # Check zero
    if value == 0:
        return HttpResponse(counter.value)
    # Get counter
    counter = Counter.objects.get(id=counter_id)
    # Check ownership
    if counter.owner != request.user:
        return redirect("/")
    # Increment
    counter.value += value
    # Create count
    count = Count(counter=counter, value=value)
    # Save
    counter.save()
    count.save()
    # Return updated value
    return HttpResponse(counter.value)


def delete(request, counter_id):
    # Convert to ints
    counter_id = int(counter_id)
    # Get counter
    counter = Counter.objects.get(id=counter_id)
    # Check ownership
    if counter.owner != request.user:
        return redirect("/")
    # Increment orders below counter
    lower_counters = Counter.objects.filter(
        owner=request.user,
        order__gt=counter.order)
    # Got none (last object deleted)
    if lower_counters is None:
        pass
    # Got at least 1
    else:
        for counteri in lower_counters:
            counteri.order -= 1
            counteri.save()
    # Delete
    counter.delete()
    # Return redirect
    return redirect("/")


def reorder(request, counter_id, new_pos):
    # Convert to ints
    counter_id = int(counter_id)
    new_pos = int(new_pos)
    # Get counter
    counter = Counter.objects.get(id=counter_id)
    # Check ownership
    if counter.owner != request.user:
        return redirect("/")
    # Get old counter pos
    old_pos = counter.order
    # Change order of every counter between old and new
    if new_pos > old_pos:
        # decrement all
        for i in range(old_pos+1, new_pos+1):
            counteri = Counter.objects.filter(owner=request.user).get(order=i)
            counteri.order -= 1
            counteri.save()
    else:
        # increment all
        for i in range(old_pos-1, new_pos-1, -1):
            counteri = Counter.objects.filter(owner=request.user).get(order=i)
            counteri.order += 1
            counteri.save()
    # Update counter
    counter.order = new_pos
    # Save
    counter.save()
    # Return not needed
    return HttpResponse("Empty")


def resize(request, counter_id, height, width):
    # Convert to ints
    counter_id = int(counter_id)
    height = int(height)
    width = int(width)
    # Get counter
    counter = Counter.objects.get(id=counter_id)
    # Check ownership
    if counter.owner != request.user:
        return redirect("/")
    # Resize
    counter.height = height
    counter.width = width
    # Save
    counter.save()
    # Return not needed
    return HttpResponse("Empty")


def rename(request, counter_id, name):
    # Clean and convert
    counter_id = int(counter_id)
    name = escape(name).strip()
    # Get counter
    counter = Counter.objects.get(id=counter_id)
    # Check ownership
    if counter.owner != request.user:
        return redirect("/")
    # Rename
    counter.name = name
    # Save
    counter.save()
    # Return new name
    return HttpResponse(name)


def sameday(current_date, count_date, ctype):
    if ctype == "week" and current_date.date() == count_date.date():
        return True
    elif ctype == "month" and (current_date - count_date).days < 3:
        return True
    elif ctype == "year" and current_date.month == count_date.month:
        return True
    return False


def chart(request, counter_id, ctype):
    # Convert to ints
    counter_id = int(counter_id)
    # Get format
    current_date = timezone.now()
    if ctype == "week":
        days = 7
        bins = 7
        cfmt = [(current_date-relativedelta(days=i)).strftime("%b %d, %Y")
                for i in range(bins-1, -1, -1)]
    elif ctype == "month":
        days = 30
        bins = 10
        cfmt = [(current_date-relativedelta(days=i*3)).strftime("%b %d, %Y")
                for i in range(bins-1, -1, -1)]
    elif ctype == "year":
        days = 365
        bins = 12
        cfmt = [(current_date-relativedelta(months=i)).strftime("%B, %Y")
                for i in range(bins-1, -1, -1)]
    else:
        return redirect("/")
    # Get counter
    counter = Counter.objects.get(id=counter_id)
    # Check ownership
    if counter.owner != request.user:
        return redirect("/")
    # Get counts for week/month/year
    lookback = (current_date-relativedelta(days=days))
    counts = Count.objects.filter(counter=counter, created__gt=lookback)
    counts_number = len(counts)
    # Build data for # of days specified by back
    data = {
        "labels": cfmt,
        "datasets": [{
            "label": "Counter Value",
            "type": "line",
            "backgroundColor": "rgba(13,92,99,.3)",
            "borderColor": "rgba(13,92,99,.7)",
            "borderWidth": 2,
            "pointBorderWidth": 2,
            "pointRadius": 5,
            "pointHoverRadius": 7,
            "pointHitRadius": 7,
            # Data entry 1: data["datasets"][0]["data"][n]
            "data": [0] * bins}, {
            "label": "Updates",
            "type": "bar",
            "backgroundColor": "rgba(68,161,160,.3)",
            "borderColor": "rgba(68,161,160,.7)",
            "borderWidth": 2,
            # Data entry 2: data["datasets"][1]["data"][n]
            "data": [0] * bins}]}
    # Work backwards from today
    countidx = 0
    current_value = counter.value
    for i in range(bins-1, -1, -1):
        # Assign value
        data["datasets"][0]["data"][i] = current_value
        # Calculate counts
        current_counts = 0
        while countidx < counts_number\
                and sameday(current_date, counts[countidx].created, ctype):
            current_value -= counts[countidx].value
            current_counts += 1
            countidx += 1
        # Assign counts
        data["datasets"][1]["data"][i] = current_counts
        # Moveback date
        if ctype == "week":
            current_date = current_date-relativedelta(days=1)
        elif ctype == "month":
            current_date = current_date-relativedelta(days=3)
        elif ctype == "year":
            current_date = current_date-relativedelta(months=1)
    # Return data
    json_data = json.dumps(data)
    return HttpResponse(
        json_data,
        content_type="application/json")
