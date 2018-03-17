//INIT params BEGIN ---------------------
var data = {};
var host = "https://api.lafranceinsoumise.fr";
var routeApi = "/legacy/events/";
var params1 = "?max_results=100&close_to=";
var km = 30000;
var codePostal = 69003;
var lat = Number("45.728113");
var lon = Number("4.877817");

var calendar = {};
var events = [];
$(document).ready(function() {
    calendar = $('#calendar');
    calendar.fullCalendar({
        themeSystem: 'bootstrap4',
        header: {
            left: 'title',
            center: '',
            right: 'prev,today,next, month,agendaWeek,agendaDay,listMonth'
        },
        buttonText: {
            prev: '<',
            next: '>',
            listMonth: 'Liste'
        },
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: events
    });
});
//INIT params ENDS ---------------------
function resetEvents() {
    calendar.fullCalendar('removeEventSources');
    events = [];
}

function getUrl() {
    var coordinates = "[\"" + lon + "\",\"" + lat + "\"]";
    var params2 = "{\"max_distance\":\"" + km + "\",\"coordinates\":" + coordinates + "}";
    return host + routeApi + params1 + params2
}

function getRadioBtnValue() {
    var radios = document.getElementsByName('optKm');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}

function search(byGeoloc) {
    document.getElementById("loading").style.display = "block";
    resetEvents();
    km = getRadioBtnValue();
    if (byGeoloc) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(searchWithPosition);
        }
        else {
            alert("Geolocation non supporté par votre navigateur");
        }
    }
    else {
        codePostal = document.getElementById('codePostal').value;
        if (!codePostal) { codePostal = "69003"; } //by dedault LYON ;)
        reloadIframeOnCodePostal(codePostal);
        searchWithCodePostal(codePostal);
    }
}

function searchWithCodePostal(codePostal) {
    var host = "https://nominatim.openstreetmap.org/";
    var route = "/search/?format=json&q=";
    var url = host + route + codePostal + ",France";
    console.log(url);
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(data, statut) {
            if (data) {
                lat = data[0].lat;
                lon = data[0].lon;
                getEvents(getUrl());
            }
        }
    });
}

function searchWithPosition(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    getPostalCodeFromGeoLoc(lat, lon);
    getEvents(getUrl());
}

function getPostalCodeFromGeoLoc(lat, lon) {
    var host = "https://nominatim.openstreetmap.org/";
    var route = "/search/?format=json&q=";
    var cp = /((2[A|B])|[0-9]{2})[0-9]{3}/;
    var url = host + route + lat + ',' + lon;
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(data, statut) {
            if (data) {
                codePostal = data[0].display_name.match(cp)[0];
                if (!codePostal) { codePostal = "69003"; }
                reloadIframeOnCodePostal(codePostal);
            }
        }
    });
}

function colorAndAddEvents(items) {
    items.forEach(function(event) {
        event.start = event.start_time;
        event.end = event.end_time;
        event.title = "(" + event.participants + ")" + event.name;
        event.url = "https://agir.lafranceinsoumise.fr/" + event.path;
        if (event.participants < 2 || !event.participants) {
            event.color = "red";
        }else if( event.participants <5){
            event.color = "orange";
        }else if( event.participants <10){
            event.color = "#ffeb00";
        }else if( event.participants <15){
            event.color = "green";
        }else if( event.participants <30){
            event.color = "blue";
        }else{
            event.color = "purple";
        }
        events.push(event);
    });
    calendar.fullCalendar('addEventSource', events);
    document.getElementById("loading").style.display = "none";
}

function getEvents(inputUrl) {
    console.log("get from ", inputUrl);
    $.ajax({
        url: inputUrl,
        method: 'GET',
        dataType: 'json',
        success: function(data, statut) {
            colorAndAddEvents(data._items);
        }
    });
}

function reloadIframeOnCodePostal(zipcode) {
    console.log("reload ifram with codePostal=", zipcode);
    document.getElementById('mapframe').src = "";
    document.getElementById('mapframe').src = "https://carte.lafranceinsoumise.fr/?zipcode=" + zipcode + "&event_type=evenements_locaux,reunions_circonscription";
}

function reloadIframeOnIdEvent(id) {
    console.log("reload ifram on event=", id);
    document.getElementById('mapframe').src = "https://carte.lafranceinsoumise.fr/?&event_id=" + id + ",events";
}

//init first search on lyon :P
getEvents(getUrl());
