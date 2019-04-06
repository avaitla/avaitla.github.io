var curContent = "descriptions";
var map;
var markerArray = [];

function initialize()
{
    setupHoverEffects();
    setupScrollPane();
    setupFancyBox();
    setupGoogleMaps();
    setupFinalizers();
    
}

function setupFinalizers()
{

}

function setupGoogleMaps()
{
    myLatLng = new google.maps.LatLng(41.791, -87.599);
    var myOptions = {
        center: myLatLng,
        zoom: 17,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    var allAddrs = $("#list-items .tour-address");

    var startAddr = allAddrs.first().text();
    var endAddr = allAddrs.last().text();
    
    var wayAddr = new Array();
    allAddrs.each(function(index) {
        if(index > 0 && index < (allAddrs.length - 1))
        {
            wayAddr.push({ location : $(this).text(), stopover : true });
        }
    });

    var DirRequest = {
        origin      : startAddr,
        destination : endAddr,
        
        waypoints   : wayAddr,
        
        travelMode : google.maps.TravelMode.WALKING,
        unitSystem : google.maps.UnitSystem.IMPERIAL,
        optimizeWaypoints        : false,
        provideRouteAlternatives : false
    }

    var directionsService = new google.maps.DirectionsService();
    directionsService.route(DirRequest, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK)
        {
            var directionRenderOptions = {
                map : map,
                panel : directionsPanel,
                suppressInfoWindows : true,
                suppressMarkers : true
            };

            var directionsRenderer = new google.maps.DirectionsRenderer(directionRenderOptions);
            directionsRenderer.setDirections(response);
            window.setTimeout(function(){ showWaypointMarkers(response); }, 1500);
        }
    });
}

// Taken From http://stackoverflow.com/questions/8896669/google-maps-api-v3-custom-driving-directions-markers
function showWaypointMarkers(directionsResponse)
{
    var routeLegs = directionsResponse.routes[0].legs;
    var allImages = $("#directionsPanel").find("img");
    
    
    
    var len = routeLegs.length - 1;
    for (var i = 0; i < len; i++)
    {
        var iconUrlString = "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=";
        var iconUrl = iconUrlString + (i+2) + "|ADDE63";
        
        var marker = new google.maps.Marker({
            position: routeLegs[i+1].start_location,
            map: map,
            title: "Stop number: " + (i+1),
            icon: {url: iconUrl}
        });
        
        var iconImageObj = $("<img src='" + iconUrl + "'>");
        attachInfoWindow(marker, iconImageObj, i+1, routeLegs[i+1]);
        allImages.eq(i+1).replaceWith(iconImageObj);
    }
    
    
    var startIconUrlString = "https://chart.googleapis.com/chart?chst=d_map_xpin_icon&chld=pin_star|home|478080|ADDE63";
    var startMarker = new google.maps.Marker({
        position : routeLegs[0].start_location,
        map : map,
        title : "Origin",
        icon: {url: startIconUrlString}
    });
    
    var startIconImageObj = $("<img src='" + startIconUrlString + "'>");
    attachInfoWindow(startMarker, startIconImageObj, 0, routeLegs[0]);
    allImages.eq(0).replaceWith(startIconImageObj);



    var endIconUrlString = "https://chart.googleapis.com/chart?chst=d_map_xpin_icon&chld=pin_star|camping|478080|ADDE63";
    var endMarker = new google.maps.Marker({
        position : routeLegs[len].end_location,
        map : map,
        title : "Destination",
        icon: {url: endIconUrlString}
    });
    
    var endIconImageObj = $("<img src='" + endIconUrlString + "'>");
    attachInfoWindow(endMarker, endIconImageObj, len + 1, routeLegs[len]);
    allImages.eq(len + 1).replaceWith(endIconImageObj);
}


function functionalOverrider(i, startaddr)
{
    var inContent = grabExhibitHTML(i) + grabPostExhibitHTML(i);   
    return ("<div class='infoMark' id='infoMarker'" + (i) + ">" + inContent + "<p class='start_addr'>" + startaddr + "</p></div>");
}

function attachInfoWindow(marker, iconImageObj, legIndex, leg) {
    var infowindow = new google.maps.InfoWindow({
        content: functionalOverrider(legIndex + 1, leg.start_address)
    });
    
    google.maps.event.addListener(marker, 'mouseover', function(){ //when the marker on map is clicked open info-window
        $("#exhibit" + (legIndex + 1)).css({'background-color' : '#BFBFBF', 'color' : 'black'});
        infowindow.open(map,marker);
    });
    
    google.maps.event.addListener(marker, 'mouseout', function() {
      $("#exhibit" + (legIndex + 1)).css({'background-color' : 'transparent', 'color' : '#C9C9C9'});
      infowindow.close();
    });
    
    google.maps.event.addListener(marker, 'click', function() {
       fancyBoxWindowOpen(legIndex + 1); 
    });

    iconImageObj.click(function(){ //when the marker on the driving directions is clicked, open info-window
        fancyBoxWindowOpen(legIndex + 1);
    });
    
    iconImageObj.mouseover(function(){
        infowindow.open(map, marker); 
    });
    
    iconImageObj.mouseout(function(){
       infowindow.close(); 
    });
    
    $("#exhibit" + (legIndex + 1)).mouseenter(function(){
       infowindow.open(map, marker); 
    });
    
    $("#exhibit" + (legIndex + 1)).mouseleave(function(){
        infowindow.close();
    });
}

function fancyBoxWindowOpen(i)
{ $("#exhibit" + i).click(); }

function grabExhibitHTML(i)
{ return $("#exhibit" + i).html(); }

function grabPostExhibitHTML(i)
{ return $("#exhibit" + i + "_").html(); }







function setupFancyBox()
{
    $(".fancybox").fancybox();
    $(".fancybox-button").fancybox({
  	    prevEffect		: 'none',
  	    nextEffect		: 'none',
  	    closeBtn		: false,
  	    helpers		    : { title : { type : 'inside' }, buttons : {} }
    });
}

function setupScrollPane()
{
    $('.scroll-pane').height($(window).height() - 50);
    $('#directionsPanel').height($(window).height() - 50);
    $('.scroll-pane').jScrollPane({showArrows: true});
    $(window).resize(function()
    {
        $("#directionsPanel").height($(window).height() - 50);
        $('.scroll-pane').height($(window).height() - 50);
        $('.scroll-pane').jScrollPane({showArrows: true});
    });
}

function setupHoverEffects()
{
    $('.tour-li').css({'color' : '#C9C9C9'});	

    $('.tour-li').mouseenter(function(event){
      $(this).css({'background-color': '#C9C9C9', 'color' :'black'});
    });

    $('.tour-li').mouseleave(function(event){
      $(this).css({'background-color' : 'transparent', 'color' : '#C9C9C9'});
    });
    
    $("#dirHover").click(function(event){
        if (curContent == "descriptions")
        {
            curContent = "directions";
            $("#dirHover").text("Descriptions");
            $("#directionsPanel").css({"display" : "block"});
            $("#list-items").css({"display" : "none"});
        }

        else
        {
            curContent = "descriptions"; 
            $("#dirHover").text("Directions");
            $("#directionsPanel").css({"display" : "none"});
            $("#list-items").css({"display" : "block"});
        }
    });
    
    $('#dirHover').mouseenter(function() { $(this).css({'color' : '#C9C9C9'}); });
    $('#dirHover').mouseleave(function() { $(this).css({'color' : 'white'});});

    
    $("#about").click(function(event){ $("#clickAbout").click(); });
    
    $('#about').mouseenter(function() { $(this).css({'color' : '#C9C9C9'}); });
    $('#about').mouseleave(function() { $(this).css({'color' : 'white'});});
}
