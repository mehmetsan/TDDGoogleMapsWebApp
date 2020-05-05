var map;
var myLoc = {
    "lat": 0,
    "lng": 0
  };
var queryLocation = {
    "lat": 0,
    "lng": 0
  };
//40.714224,-73.961452
//48.743271, 2.639777
//48.839868, 2.354244
//51.527105, -0.451082 england

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.433373, lng: -0.712251},
    zoom: 8
  });


}

function goLoc() {

  latVal = parseFloat(document.getElementById("latInput").value)
  lngVal = parseFloat(document.getElementById("lngInput").value)

  myLoc.lat = latVal;
  myLoc.lng = lngVal;

  var latLng = new google.maps.LatLng(latVal, lngVal);
  map.zoom = 13;
  map.panTo(latLng);

}

function locate(){
  var infoWindow = new google.maps.InfoWindow;
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      myLoc.lat = position.coords.latitude;
      myLoc.lng = position.coords.longitude;


      infoWindow.setPosition(myLoc);
      infoWindow.setContent('Location found. '+ myLoc.lat + ', '+myLoc.lng);
      infoWindow.open(map);

      map.zoom= 13;
      map.setCenter(myLoc);
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function findDistance(){


  desired1 = ["locality", "political"];
  desired2 = ["postal_town"];
  desired3 = ["administrative_area_level_1", "political"];


  locationQuery = httpGet("https://maps.googleapis.com/maps/api/geocode/json?latlng="+myLoc.lat+", "+myLoc.lng+"&key=AIzaSyDkhX_9X-hkvRHITaw5XJjKhFBjNpfRUGw");
  const json = locationQuery;
  const results1 = JSON.parse(json);
  console.log(results1["results"][0]["address_components"]);

  list = results1["results"][0]["address_components"];

  longName = "";
  types = "";
  cont = true;
  cont2 = true;

  for (index = 0; index < list.length; index++) {
    if( compare(list[index]["types"], desired1) ){
      longName = list[index]["long_name"];
      types = list[index]["types"];
      cont = false;
    }
    else if( compare(list[index]["types"], desired2) & cont){
      longName = list[index]["long_name"];
      types = list[index]["types"];
      cont2 = false;
    }
    else if( compare(list[index]["types"], desired3) & cont & cont2){
      longName = list[index]["long_name"];
      types = list[index]["types"];
    }

  }
  console.log(longName);
  console.log(types);

  requestString = "https://maps.googleapis.com/maps/api/geocode/json?address="+ longName + "&key=AIzaSyDkhX_9X-hkvRHITaw5XJjKhFBjNpfRUGw";
  cityRequest = httpGet(requestString);
  const json2 = cityRequest;
  const results2 = JSON.parse(json2);


  console.log(results2["results"]);

  list2 = results2["results"];
  console.log(list2[0]);


  for (index = 0; index < list2.length; index++) {
    if(list2[index]["formatted_address"].includes(longName)){
      queryLocation.lat = list2[index]["geometry"]["location"]["lat"];
      queryLocation.lng = list2[index]["geometry"]["location"]["lng"];
    }
  }
  distance = getDistance(myLoc,queryLocation);

  document.getElementById("Answer").innerHTML = "Distance to city center of "+longName+ " is  \n " + distance + " meters";

}

function findElevation(){
  url = "https://maps.googleapis.com/maps/api/elevation/json?locations=" + myLoc.lat+","+ myLoc.lng +"&key=AIzaSyDkhX_9X-hkvRHITaw5XJjKhFBjNpfRUGw";
  proxyURL = "https://cors-anywhere.herokuapp.com/"+url;

  elevationQuery = httpGet(proxyURL);
  const json3 = elevationQuery;
  const results3 = JSON.parse(json3);

  list = results3["results"];
  elevation = list[0]["elevation"];

  distanceToCenter = (6378137 + elevation) / 1000; //in Kilometers
  console.log(distanceToCenter);

  document.getElementById("Answer").innerHTML = "Distance to C.O.E. is " + distanceToCenter + " meters";
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function compare(l1, l2){
  if(l1.length != l2.length)
    return false;

  for (k = 0; k < l1.length; k++) {
    if(l1[k] != l2[k])
      return false;
  }
  return true;
}

function rad(x) {
  return x * Math.PI / 180;
};

function getDistance(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.lng - p1.lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d/1000; // returns the distance in kilometer
};
