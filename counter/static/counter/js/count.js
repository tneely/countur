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
}

var sort = function() {
	$( "#counter-space" ).sortable({
		containment: "parent",
		distance: 25,
		cursor: "move",
		start: function( e, ui ) {
			ui.item.data("startindex", ui.item.index());
		},
		stop: function( e, ui ) {
			var startIndex = ui.item.data("startindex");
			var newIndex = ui.item.index();
			if ( startIndex != newIndex ) {
				ajax_reorder(ui.item.find("input").attr('id'), newIndex);
			}
		}
	});
}

var fontsize = function(counter) {
	var sizeW = $(counter).width() * .5;
	var sizeH = $(counter).height() * .7;
	var fontSize = Math.min(sizeW, sizeH);
	$(counter).find(".count").css('font-size', fontSize);
};

var namewidth = function(counter) {
	var sizeW = $(counter).width() -150 ;
	$(counter).find("#inner-name").css('max-width', sizeW);
}

var resize = function() {
	var maxW = $( "#counter-space" ).width() - 20;
	var mobile = false;
	if ($(window).width() < 768) {
		mobile = true;
	}
	$( ".counter" ).resizable({
		maxWidth: maxW,
		minHeight: 250,
		minWidth: 350,
		disabled: mobile,
		resize: function( e, ui ) {
			fontsize(this);
			namewidth(this);
		},
		stop: function( e, ui ) {
			ajax_resize($(this).find("input").attr('id'), ui.size.height, ui.size.width);
		},
	});
}

var mobileFix = function() {
	if ($(window).width() < 768) {
		var maxW = $( ".counter" ).parent().width() - 40;
		$( ".counter" ).width(maxW);
		$( ".counter" ).height(250);
	}
}

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
			$(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
		} else {
			alert('Sorry, the minimum value was reached');
			$(this).val(minValue);
		}
		if(valueCurrent <= maxValue) {
			$(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
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
}

var flip = function() {
	$(".stats").click(function() {
		$(".front").toggleClass("flipped");
		$(".card .back").toggleClass("flipped");
		console.log($(this).parent().parent().parent())
	});
	$(".counts").click(function() {
		$(".front").toggleClass("flipped");
		$(".card .back").toggleClass("flipped");
	});
}

var editing = function() {
	$(".edit").click(function() {
		$(this).parent().parent().find(".name").toggle();
		$(this).parent().parent().find(".editing").toggleClass("back");
	});
	$(".cancel").click(function() {
		$(this).parent().parent().find(".name").toggle();
		$(this).parent().parent().find(".editing").toggleClass("back");
		orig_name = $(this).parent().parent().find(".name #inner-name").html()
		$(this).parent().find(".edit-input").val(orig_name)
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
}

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
}

var ajax_create = function(name, value) {
	// check name
	name = name.trim()
	if ( name_check(name) ) {
		// Form ajax
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			location.reload();
			console.log("reloaded");
		}};
		// Submit ajax
		xhttp.open("GET", "create/"+name+"/"+value+"/", true);
		xhttp.send();
	}
}

var ajax_increment = function(counter_id) {
	// Get increment value
	var value = $(".increment").find("#"+counter_id).val();
	// Form ajax
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		$(".increment").find("#"+counter_id).parent().parent().find(".count").html(xhttp.responseText);
	}};
	// Submit ajax
	xhttp.open("GET", counter_id+"/"+value, true);
	xhttp.send();
}

var ajax_resize = function(counter_id, height, width) {
	// Form ajax
	var xhttp = new XMLHttpRequest();
	// Submit ajax
	xhttp.open("GET", "resize/"+counter_id+"/"+height+"/"+width, true);
	xhttp.send();
}

var ajax_rename = function(counter_id, name) {
	// check name
	name = name.trim()
	if ( name_check(name) ) {
		// Form ajax
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			$(".editing #"+counter_id).parent().parent().find(".name #inner-name").html(xhttp.responseText);
		}};
		// Submit ajax
		xhttp.open("GET", "rename/"+counter_id+"/"+name, true);
		xhttp.send();
	}
}
var ajax_reorder = function(counter_id, new_pos) {
	// Form ajax
	var xhttp = new XMLHttpRequest();
	// Submit ajax
	xhttp.open("GET", "reorder/"+counter_id+"/"+new_pos, true);
	xhttp.send();
}

// Enable functions
var main = function() {
	create();
	sort();
	resize();
	mobileFix();
	$.each( $(".counter"), function(k,v) {
		fontsize($(this));
		namewidth($(this));
	});
	increment();
	flip();
	editing();
	// Disable static stuff
	$( "#counter-space .static" ).sortable( "disable" );
	$( ".static" ).resizable( "disable" );

}
$(document).ready(main);