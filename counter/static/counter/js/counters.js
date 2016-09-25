// Depends on basic_counts.js for:
// fonsize()
// name_check()

// Create new counters
var create = function() {
	$(".btn-create").click(function() {
		$("#create-form").slideDown("fast");
		if ( $(this).hasClass("create-submit") ) {
			// Get name and starting value
			var name = $("#create-name").val();
			var value = $("#create-value").val();
			// Submit
			ajax_create(name, value);
		} else {
			$(".btn-create").addClass("create-submit");
		}
	});
	$("#close-create").click(function() {
		$("#create-form").slideUp("fast");
		$(".btn-create").removeClass("create-submit");
	});
};

// Allow counters to be rearranged
var sort = function() {
	$( "#counter-space" ).sortable({
		containment: "parent",
		distance: 25,
		cursor: "move",
		update: function( e, ui ) {
			ajax_reorder(ui.item.find("input").attr('id'), ui.item.index());
		}
	});
};

// Allow counters to be resized
var resize = function() {
	var maxW = $( "#counter-space" ).width() - 20;
	var minW = 350;
	var minH = 250;
	var mobile = false;
	if ($(window).width() < 768) {
		mobile = true;
	}
	$( ".counter" ).resizable({
		maxWidth: maxW,
		minHeight: minH, // also enforced in python counter views
		minWidth: minW,
		disabled: mobile,
		resize: function( e, ui ) {
			fontsize(this);
			namewidth(this);
		},
		stop: function( e, ui ) {
			var height = Math.max(ui.size.height,minH);
			var width = Math.max(ui.size.width, minW);
			ajax_resize($(this).find("input").attr('id'), height, width);
		},
	});
};

/* =====================
==== AJAX FUNCTIONS ====
======================*/

var ajax_create = function(name, value) {
	name = name.trim();
	if ( name_check(name) ) {
		// Form ajax
		$.ajax({
			url: "create/"+name+"/"+value,
			error: function() {
				// put in alert or something here
				console.log("something broke");
			}
		}).done(function(data) {
			location.reload();
		});
	}
};

var ajax_resize = function(counter_id, height, width) {
	// Form ajax
	$.ajax({
		url: "resize/"+counter_id+"/"+height+"/"+width,
		error: function() {
			// put in alert or something here
			console.log("something broke");
		}
	});
};

var ajax_reorder = function(counter_id, new_pos) {
	// Form ajax
	$.ajax({
		url: "reorder/"+counter_id+"/"+new_pos,
		error: function() {
			// put in alert or something here
			console.log("something broke");
		}
	});
};

// Enable functions
var main = function() {
	create();
	sort();
	resize();
};
$(document).ready(main);
