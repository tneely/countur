// Rescale font size on counter size
var fontsize = function(counter) {
	var sizeW = $(counter).width() * 0.5;
	var sizeH = $(counter).height() * 0.7;
	var fontSize = Math.min(sizeW, sizeH);
	$(counter).find(".count").css('font-size', fontSize);
};

// Rescale name div size to cut off on smaller counters
var namewidth = function(counter) {
	var sizeW = $(counter).width() -150 ;
	$(counter).find("#inner-name").css('max-width', sizeW);
};

// Counter increment and decrement buttons + input limits
var increment = function() {
	$('.btn-number').click(function(e) {
		e.preventDefault();
		type      = $(this).attr('data-type');
		var input = $(this).parent().find("input");
		var currentVal = parseInt(input.val());
		if (!isNaN(currentVal)) {
			if(type == 'minus') {

				if(currentVal > input.attr('min')) {
					input.val(currentVal - 1).change();
				}
				if(parseInt(input.val()) == input.attr('min')) {
					$(this).attr('disabled', true);
				}

			} else if(type == 'plus') {

				if(currentVal < input.attr('max')) {
					input.val(currentVal + 1).change();
				}
				if(parseInt(input.val()) == input.attr('max')) {
					$(this).attr('disabled', true);
				}

			}
		} else {
			input.val(0);
		}
	});
	$('.input-number').change(function() {

		minValue =  parseInt($(this).attr('min'));
		maxValue =  parseInt($(this).attr('max'));
		valueCurrent = parseInt($(this).val());

		name = $(this).attr('name');
		if(valueCurrent >= minValue) {
			$(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled');
		} else {
			alert('Sorry, the minimum value was reached');
			$(this).val(minValue);
		}
		if(valueCurrent <= maxValue) {
			$(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled');
		} else {
			alert('Sorry, the maximum value was reached');
			$(this).val(maxValue);
		}


	});
	$(".input-number").keydown(function (e) {
			// Allow: backspace, delete, tab, escape, enter and .
			if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
				 // Allow: Ctrl+A
				(e.keyCode == 65 && e.ctrlKey === true) ||
				 // Allow: home, end, left, right
				(e.keyCode >= 35 && e.keyCode <= 39) ||
				// Allow: minus
				(e.keyCode == 109 || e.keyCode == 189 || e.keyCode == 173)) {
					 // let it happen, don't do anything
					 return;
			}
			// Ensure that it is a number and stop the keypress
			if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
				e.preventDefault();
			}
		});
};

// Allow name of counter to be edited
var editing = function() {
	$(".edit").click(function() {
		$(this).parent().parent().find(".name").toggle();
		$(this).parent().parent().find(".editing").toggleClass("back");
	});
	$(".cancel").click(function() {
		$(this).parent().parent().find(".name").toggle();
		$(this).parent().parent().find(".editing").toggleClass("back");
		orig_name = $(this).parent().parent().find(".name #inner-name").html();
		$(this).parent().find(".edit-input").val(orig_name);
	});
	$(".confirm").click(function() {
		name = $(this).parent().find(".edit-input").val();
		if ( name.length < 1 ) {
			alert("The name must be at least 1 character");
		}
		else if ( name.length > 50 ) {
			alert("The name must be at most 50 characters");
		}
		else if ( name == $(".name #inner-name").html() ) {
			$(this).parent().parent().find(".name").toggle();
			$(this).parent().parent().find(".editing").toggleClass("back");
		} else {
			$(this).parent().parent().find(".name").toggle();
			$(this).parent().parent().find(".editing").toggleClass("back");
			counter_id = $(this).parent().find(".edit-input").attr('id');
			if (name != $(this).parent().parent().find(".name").html()) {
				ajax_rename(counter_id, name);
			}
		}
	});
};

// Make sure counter names are kosher
var name_check = function(string) {
	// define allowed characters
	var regx = /^[A-Za-z0-9 ]+$/;
	// check character length
	if ( string.length < 1 ) {
		alert("The name must be at least 1 character long.");
		return false;
	}
	// contains illegal characters (anything not alphanumeric or space)
	else if ( !regx.test(string) ) {
		alert("The name cannot contain any symbols.");
		return false;
	}
	// passed check
	else {
		return true;
	}
};

// Fix counter sizes on mobile devices
var mobileFix = function() {
	if ($(window).width() < 768) {
		// Fix counter size
		var maxW = $( ".counter" ).parent().width() - 40;
		$( ".counter" ).width(maxW);
		$( ".counter" ).height(250);
		// Hide features
		$( ".btn-number").hide();
		$( ".icon-left .edit").hide();
		// Name
		var sizeW = maxW;
		$(".title").css('max-width', sizeW);
	}
};

/* =====================
==== AJAX FUNCTIONS ====
======================*/

var ajax_increment = function(counter_id) {
	var value = $(".increment").find("#"+counter_id).val();
	if ( value !== 0 ) {
		// Form ajax
		$.ajax({
			url: counter_id+"/"+value,
			error: function() {
				// put in alert or something here
				console.log("something broke");
			}
		}).done(function(data) {
			$(".increment").find("#"+counter_id).parent().parent().find(".count").html(data);
		});
	}
};

var ajax_rename = function(counter_id, name) {
	name = name.trim();
	if ( name_check(name) ) {
		// Form ajax
		$.ajax({
			url: "rename/"+counter_id+"/"+name,
			error: function() {
				// put in alert or something here
				console.log("something broke");
			}
		}).done(function(data) {
			$(".editing #"+counter_id).parent().parent().find(".name #inner-name").html(data);
		});
	}
};

// Enable functions
var main = function() {
	$.each( $(".counter"), function(k,v) {
		fontsize($(this));
		namewidth($(this));
	});
	increment();
	editing();
	mobileFix();
};
$(document).ready(main);
