// "script.js" for Septa Fare Widget - might be better in alt future to rename scripts and stylesheet for widget
// defaults
var data = {};
var zoneSelection = 1;
var scheduleType = 'weekday';
var purchaseTime = 'advance_purchase';
var ticketQuantity = 1;

var $costDisplay = $('.cost-display');
var $scheduleTypeDesc = $('.hint-text');
var $septaTicketType = $('#septa-ticket-type-dropdown');
var $septaPurchaseTime = $('#septa-purchase-time-select');
var $septaTicketQuantity = $('#septa-ticket-quantity');


// updates initial cost with defaults. Could be nice to have blank defaults
var init = function(data) {
  var initialCost;
  if ($.isEmptyObject(data) !== true) {
    initialCost = generateCost(data, zoneSelection, scheduleType, purchaseTime, ticketQuantity);
    updateCost(initialCost);
  }
}

var handleScheduleTypeInfo = function(scheduleType) {
  var info = (data.info[scheduleType]);
  $scheduleTypeDesc.text(info);
}

var generateCost = function(data, zoneSelection, scheduleType, purchaseTime, ticketQuantity) {
  var cost = 0;
  for (var zone in data.zones) {
    var zoneObj = data.zones[zone];
    if (zoneObj.zone == zoneSelection) {
      var fares = zoneObj.fares;

      for (var fare in fares) {
        if (fares[fare].type === scheduleType) {
          if (scheduleType === 'anytime') {
            cost = fares[fare].price;
          } else {
            if (fares[fare].purchase === purchaseTime) {

              cost = fares[fare].price;
              cost *= ticketQuantity;
            }
          }
        }
      }
    }
  }
  return cost;
}

var updateCost = function(newCost) {
  $costDisplay.text('$'+ newCost.toFixed(2));
}

$(document).on('change', '#septa-ticket-quantity', function(e) {
  ticketQuantity = e.target.value;
  var newCost = generateCost(data, zoneSelection, scheduleType, purchaseTime, ticketQuantity);
  updateCost(newCost);
});

$(document).on('change', '#septa-zone-dropdown', function(e) {
  zoneSelection = e.target.value;
  var newCost = generateCost(data, zoneSelection, scheduleType, purchaseTime, ticketQuantity);
  updateCost(newCost);
});

$(document).on('change', '#septa-ticket-type-dropdown', function(e) {
  scheduleType = e.target.value;
  handleScheduleTypeInfo(scheduleType);

  if (scheduleType === 'anytime') {
    // set defined values for anytime option/disable
    // might be nice to have message for greater than 10 tickets for info about "anytime" option
    ticketQuantity = 10; // might be nice to reset back to previous option quantity after clicking off instead of staying @ 10
    $septaTicketQuantity.prop('value', ticketQuantity);
    $septaTicketQuantity.prop('disabled', true);
    purchaseTime = 'advance_purchase';
    $('#station-kiosk').prop('checked', true);
    $('input[type="radio"]').prop('disabled', true);
  } else { // enable
    $septaTicketQuantity.prop('disabled', false);
      $('input[type="radio"]').prop('disabled', false);
  }

  var newCost = generateCost(data, zoneSelection, scheduleType, purchaseTime, ticketQuantity);
  updateCost(newCost);
});

$(document).on('change', '#purchase-time-select', function(e) {
  purchaseTime = e.target.value;
  var newCost = generateCost(data, zoneSelection, scheduleType, purchaseTime, ticketQuantity);
  updateCost(newCost);
});


// probably do not need
$(document).ready(function() {
  var req = $.ajax({
        type: 'GET',
        url: '../fares.json',
        dataType: 'json',
        success: function(res) {
          data = res;
          init(data);
        }
    });
});
