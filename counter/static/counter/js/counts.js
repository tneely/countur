// Depends on Chart.min.js for:
// Chart

var weekLoad = false;
var monthLoad = false;
var yearLoad = false;

// Chart settings
Chart.defaults.global.defaultFontColor = "#333";
Chart.defaults.global.maintainAspectRatio = false;
var charting = function(data, focus) {
	var ctx = $(focus);
	var count_chart = new Chart(ctx, {
	    type: 'bar',
	    data: data,
	});
};

var chartHeight = function(chart) {
	var ctx = $(chart)[0].getContext('2d');
	var height = $(".counter").height() - 50;
	ctx.canvas.height = height;
};

// View stats/counts of counter
var flip = function() {
	$(".stats").click(function() {
		// load?
		if (!weekLoad) {
			ajax_load($(".increment input").attr('id'), "week");
			weekLoad = true;
		}
		$(".front").toggleClass("flipped");
		$(".card .back").toggleClass("flipped");
	});
	$(".counts").click(function() {
		$(".front").toggleClass("flipped");
		$(".card .back").toggleClass("flipped");
	});
};

var switchCharts = function() {
	$("#week").click(function(e) {
		// load?
		if (!weekLoad) {
			ajax_load($(".increment input").attr('id'), "week");
			weekLoad = true;
		}
		// buttons
		$("#week").addClass("active");
		$("#month").removeClass("active");
		$("#year").removeClass("active");
		// canvas
		$("#charting-week").removeClass("hidden");
		$("#charting-month").addClass("hidden");
		$("#charting-year").addClass("hidden");
	});
	$("#month").click(function(e) {
		// load?
		if (!monthLoad) {
			ajax_load($(".increment input").attr('id'), "month");
			monthLoad = true;
		}
		$("#week").removeClass("active");
		$("#month").addClass("active");
		$("#year").removeClass("active");
		// canvas
		$("#charting-week").addClass("hidden");
		$("#charting-month").removeClass("hidden");
		$("#charting-year").addClass("hidden");
	});
	$("#year").click(function(e) {
		// load?
		if (!yearLoad) {
			ajax_load($(".increment input").attr('id'), "year");
			yearLoad = true;
		}
		$("#week").removeClass("active");
		$("#month").removeClass("active");
		$("#year").addClass("active");
		// canvas
		$("#charting-week").addClass("hidden");
		$("#charting-month").addClass("hidden");
		$("#charting-year").removeClass("hidden");
	});
};

/* =====================
==== AJAX FUNCTIONS ====
======================*/
var ajax_load = function(counter_id, type) {
	// Form ajax
	$.ajax({
		dataType: "json",
		url: "load/"+counter_id+"/"+type,
		beforeSend: function() {
   			$("#loading").show();
   			$("#charts").hide();
		},
		success: function() {
			$("#loading").hide();
   			$("#charts").show();
		},
		error: function() {
			// put in alert or something here
			console.log("something broke");
		}
	}).done(function(data) {
		chartHeight("#charting-"+type);
		charting(data, "#charting-"+type);
	});
};

// Enable functions
var main = function() {
	flip();
	switchCharts();
};
$(document).ready(main);
