var map;
var marker;
var layer;
var nlayer;
var dataID = "1vL7PfvU7Ecp9fkaPuVn4-shsvoNmPX08GpVdMhc";
var field = "'col0>>1'";
var where = 'ST_INTERSECTS('+field+',CIRCLE(LATLNG(_L),0.1))';

function initialize() {
  var gm = google.maps,
    go = new gm.Geocoder(),
    mc = document.getElementById('map-canvas'),
    Poly = gm.geometry.poly;

  var mapOptions = {zoom: 3, mapTypeId: gm.MapTypeId.TERRAIN};
  var markerOptions = {draggable:true};
  map = new gm.Map(mc, mapOptions);
  marker = new gm.Marker(markerOptions);
  marker.setMap(map);

  // renders original map
  layer = new gm.FusionTablesLayer({
    query: {
      select: "'col0>>1'",
      from: dataID
    },
    suppressInfoWindows: true
  });
  layer.setMap(map);

  gm.event.addListener(layer, 'click', function(e) {
    marker.setPosition(e.latLng);
    render(e.latLng);
  });
  gm.event.addListener(marker, 'dragend', function(e){
    render(e.latLng)
  });

  navigator.geolocation.getCurrentPosition(function(pos){
    var lat = pos.coords.latitude,
      long = pos.coords.longitude,
      position = new gm.LatLng(lat, long);
    render(position);
  }, function(){
    go.geocode({address: 'Zocalo, DF, Mexico'}, function(r, s) {
      if (s == gm.GeocoderStatus.OK) {
        render(r[0].geometry.location);
      } else alert(s);
    });
  }, {enableHighAccuracy: false, timeout: 5000});
}

function queryDatabase(where) {
  var
    gv = google.visualization,
    ep = 'http://www.google.com/fusiontables/gvizdata?tq=',
    qp = 'SELECT * FROM '+dataID+' WHERE '+where,
    dt = null;
  (new gv.Query(ep + encodeURIComponent(qp))).send(function(response){
    var info = document.getElementById('info');
    if(!response.isError()) {
      dt = response.getDataTable();
      if (dt.getNumberOfRows()) {
        info.innerHTML = dt.getValue(0,0) + '&nbsp; Medals per million:' + dt.getValue(0,6);
      } else {
        info.innerHTML = "No Disponibile";
      }
    }
  });
}

function render(position) {
  var wh = where.replace('_L',position.lat()+","+position.lng()),
    gm = google.maps;
  marker.setPosition(position);
  map.setCenter(position);
  layer.setOptions({
    styles: [{
      where: wh,
      polygonOptions: {
        fillColor: 'blue',
        strokeColor: '#00ff00',
        strokeWeight: 5
      }
    }]
  })
  queryDatabase(wh);
}

google.load("visualization", "1", {"callback" : initialize});
