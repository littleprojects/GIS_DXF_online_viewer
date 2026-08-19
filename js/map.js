
/*
ToDO:


Fullscreen:
https://leafletjs.com/SlavaUkraini/plugins.html#fullscreen-controls

Export / Print:
https://leafletjs.com/SlavaUkraini/plugins.html#printexport

Text editor for note marker:
https://summernote.org/
https://www.tiny.cloud/blog/bootstrap-wysiwyg-editor/

Ideas:
- save maps in browser -> if map have the same version, dont download it. FASTER
- Tooltip with more details to find faster linedetails
- Hidden Popups:
	- OverlappingMarkerSpiderfier to open hidden Popups
	- Dragable Popups: https://plnkr.co/edit/S1GPRm6sNwGDkD6oSCHs?p=preview&preview

*/

//global variables -> are in map indexes

//var dxf_json = pipes_json;
//var dxf_json = border_json;

//var dxf_border_files = [];
//var dxf_pipes_files = [];


var dxf_layer_ignore_list =[
	//"5",	// text borders
];

var dxf_icon_ignore_list = [
	"S183",		// North arrow
];


var map = L.map('map'); //.setView([52.3988, 12.9204], 18);

var layer_bounds 				= [];
var layer_bounds_details 		= [];
var layer_pipes 				= [];
var layer_pipes_details 		= [];

//follow the user position
var follow_location = false;
var follow_location_marker = L.marker([0, 0], {title: ''});
var follow_location_circle = L.circle([0, 0], {radius: 0});

var distance_sum = 0;

var view_bounds = { x1:0, y1:0, x2:0, y2:0};

// List Object of icons
var svgIcons = {};

//point SVG replace CircleMarker why CircleMarker Popup is blocked by other objects
svgIcons['point'] = '<svg width="10" height="10"><circle cx="5" cy="5" r="2" stroke="black" stroke-width="1" fill="" /></svg>'; //background-color: coral;

// add files to list
//dxf_border_files.push(border_json);
//dxf_pipes_files.push(pipes_json);


// add measure feature to map
L.control.scale({maxWidth:240, metric:true, imperial:false, position: 'bottomleft'}).addTo(map);

// Create polylineMeasure
const pMeasure = L.control.polylineMeasure({
  position: "topleft",
  clearMeasurementsOnStop: true
});
pMeasure.addTo(map);


/* //display a GRID Layer
L.GridLayer.CanvasCircles = L.GridLayer.extend({
	createTile: function (coords) {
		var tile = document.createElement('canvas');

		var tileSize = this.getTileSize();
		tile.setAttribute('width', tileSize.x);
		tile.setAttribute('height', tileSize.y);

		var ctx = tile.getContext('2d');

		// Draw whatever is needed in the canvas context
		// For example, circles which get bigger as we zoom in
		ctx.arc(tileSize.x / 2, tileSize.x / 2, 4 + coords.z * 1, 0, 2 * Math.PI, false);
		ctx.fill();

		return tile;
	}
});

L.gridLayer.canvasCircles = function (opts) {
	return new L.GridLayer.CanvasCircles(opts);
};

var cavasGridLayer = L.gridLayer.canvasCircles();
map.addLayer(cavasGridLayer);
*/



// find the min and max coordinates for the view bounds
function find_view_bounds(lat, lng){
	
	if (view_bounds.x1 == 0 || view_bounds.x1 < lat)	{view_bounds.x1 = lat;}
	
	if (view_bounds.y1 == 0 || view_bounds.y1 > lng) 	{view_bounds.y1 = lng;}
	
	if (view_bounds.x2 == 0 || view_bounds.x2 > lat)	{view_bounds.x2 = lat;}
	
	if (view_bounds.y2 == 0 || view_bounds.y2 < lng)	{view_bounds.y2 = lng}	
}


//print the elements in the JSON list 
function print_entitie(entitie, type, rotation_offset=0){
	
	// is element on LAYER IGNORE list?
	//if(dxf_layer_ignore_list.includes(entitie.layer)){
		//skip this icon
		//return;
	//}
	
	//type = 'border' or 'pipe'

	//print(entitie);

	//print(entitie.type);
	//print(entitie.color);
	//print(entitie.colorIndex);
	
	// calc dec color to hex color
	var color = '#' + String(entitie.color.toString(16));
	
	//if (entitie.type == 'POLYLINE'){
	//if (color != '#ffffff'){
	//	print(color);
	//}
	//if (entitie.type == "LINE" && color == "#000000"){
	//if(entitie.lineweight == 18){
	//	color="#00FFFF";
	//}
	
	//convert white color to black
	if (color == '#ffffff'){color = '#000000';}

	// convert blue to green
	if (color == '#6666cc'){color = '#00ff00';}

	// correct green color 
	if (color == '#ff00'){color = '#00ff00';}
	
	// Circles
	if (entitie.type == "POLYLINE"){
		if (entitie.vertices.length == 3){
			if ('bulge' in entitie.vertices[0]){
				
				//print(entitie);
				
				var start_point = [entitie.vertices[1].x, entitie.vertices[1].y];
				var end_point   = [entitie.vertices[2].x, entitie.vertices[2].y];
				
				var line_angle = getPointAngle(start_point[0], start_point[1], end_point[0], end_point[1]);
				var line_dist  = getPointDistance(start_point[0], start_point[1], end_point[0], end_point[1]);
				
				var circ_center = getRotatedPoint(start_point[0], start_point[1], -line_angle, line_dist/2);
				
				var point = XYtoLatLng(circ_center[0], circ_center[1]);
				
				//L.marker(XYtoLatLng(start_point[0], start_point[1]), {title: 'Handle: ' + entitie.handle}).addTo(map);
				//L.marker(XYtoLatLng(end_point[0], end_point[1]), {title: 'Handle: ' + entitie.handle}).addTo(map);
				//L.marker([point.lat, point.lng], {title: 'Handle: ' + entitie.handle}).addTo(map);
				
				var circ_marker = L.circle([point.lat, point.lng], {radius: line_dist/2, fill: false, color: color}); //.addTo(map);
				
				//print(circ_marker);
				
				if (type=='border'){
					layer_bounds_details.push(circ_marker);
				}

				if (type=='pipe'){
					layer_pipes_details.push(circ_marker);
					layer_pipes.push(circ_marker);
				}
				
				return;				
			}
		}
	}
	
	
	//LINE or POLYLINE
	if (entitie.type == "LINE" || entitie.type == "POLYLINE"){

		//skip lines with 3 steps -> circle around KH (Kugelhahn) u VE 
		if (entitie.type == "POLYLINE" && type == 'pipe'  && entitie.vertices.length == 3){
			//print(entitie)
			return;
		}

		var points = [];

		//if (type=='pipe' && color == "#000000" && entitie.lineType == "REGEN"){
		//	color="#FFFF00";
		//}

		// add points to list
		for (var i = 0; i < entitie.vertices.length; i++){
		 
			var point = XYtoLatLng(entitie.vertices[i].x, entitie.vertices[i].y);
		 
			points.push([point.lat, point.lng]);

			// dist calc at colord lines
			if (i > 0 && color == "#ff0000"){
				//TODO: Distance check ist falsch
				distance_sum += getDistance(points[i-1][0], points[i-1][1], points[i][0], points[i][1]);
			}
			
			//if (type == 'pipe'  && entitie.vertices.length == 3){
			//	L.marker([point.lat, point.lng], {title: 'Handle: ' + entitie.handle}).addTo(map);
			//}
		}

		// corner case Circle
		// POLYLINE + vertices.length = 3   bulge: -1 ?  Ausbuchtung
		
		
		//L.marker(points[0], {title: 'Handle: ' + entitie.handle}).addTo(map);

		//lineType: "Continuous"   default
		var dashArray = null;
		var dashOffset = null;
		var opacity = 1;
		var weight = 3;

		//lineType: "STPUNKT1"
		if (entitie.lineType == "STPUNKT1"){
			dashArray = '20, 20';
			dashOffset = '0';
			//print(entitie);
		}

		//Maßzahlen - linienart 36 - dünn und gestrichelt
		if(entitie.lineweight == 18){
			dashArray = '2, 5';
			dashOffset = '0';
			weight = 1;
		}

		//Trassierung
		if(entitie.lineweight == 25){
			//dashArray = '2, 5';
			//dashOffset = '0';
			weight = 1;
		}

		/*
		if(entitie.lineType == "REGEN"){
			dashArray = '10, 10';
			dashOffset = '0';
			weight = 1;
			print(entitie);
		}
		*/

		//print(entitie.lineType);
		
		if (entitie.type == "POLYLINE"){
			//opacity = 0.5;
			//weight = 1;
		}
		
		//lineweight: 35

		//create Marker
        var polyline = L.polyline(points, {color: color, dashArray: dashArray, dashOffset: dashOffset, opacity: opacity, weight:weight});

		//add to border layer
		if (type=='border'){
			layer_bounds.push(polyline);
		}

		//add to pipe (details) layer
		if (type=='pipe'){

			///*
			// colored line
			//if (entitie.type == "LINE" || (color != "#000000" || entitie.lineweight != 18)){
			// add red and green to PIPES Layer
			if(color == "#00ff00" || color == "#ff0000"){

				layer_pipes.push(polyline);
			
			//add every thing else to details Layer
			} else {
				layer_pipes_details.push(polyline);
				//print(entitie);
			}
			//*/
		}

		return;
	}
	

	//TEXT	
	if (entitie.type == "TEXT"){

		var point = XYtoLatLng(entitie.startPoint.x, entitie.startPoint.y);
		
		//L.marker([point.lat, point.lng], {title: entitie.text}).addTo(map);
		
		//var marker = new L.marker([point.lat, point.lng], { opacity: 0.01 }); //opacity may be set to zero
		//marker.bindTooltip(entitie.text, {permanent: true, className: "my-label",  }); //offset: [0, 0]
		//marker.addTo(map);
		
		//const markerPopup = L.popup().setContent( "File: <b><a href=\"" + dxf_json.file + "\"  target=\"_blank\">" + dxf_json.file + "</a></b>");
		
		// lineweight: 35
		// textHeight: 0.8		​
		
		var rotation = 0;
		
		if ("rotation" in entitie){
			rotation = -entitie.rotation -1;
		}
		
		//var add_view_point_xy = getRotatedViewPoint(entitie.startPoint.x, entitie.startPoint.y, rotation+90, 5);
		//var add_view_point = XYtoLatLng(add_view_point_xy[0], add_view_point_xy[1]);
		//L.marker(add_view_point, {title: entitie.text}).addTo(map);
		
		var text_height = Math.round(entitie.textHeight * 110);
		var text_weight = Math.round(entitie.lineweight * 10);	// normal | bold | bolder | lighter | <number> 1-1000
		var text_color = color;

		var svg_text = special_char(entitie.text);
		
		var text_opt = "";
		var svg_opt = "";
		var svg_add = "";
		var svg_g_add = "";
		var svg_g_opt = "";
		
		//<svg  height="70" width="1000" style="border-style: solid;">
		//<g  class="svg_text">
		//<text text-anchor="start" font-size="63" font-weight="180"transform="" x="0" y="50"  >(Leitung nicht aufgemessen, kartiert)</text>
		//</g>
		//</svg>
		
		//svg_opt += ' style="border: 2px solid #FF0000;" ';

		//TODO: Extend text width to 2000
		svg_opt += ' height="250" width="1000"';
		
		text_opt += ' text-anchor="start"';
	
		text_opt += ' font-size="' + text_height + '"';
		text_opt += ' font-weight="' + text_weight + '"';
		text_opt += ' fill="'+ text_color + '"'; //
		
		svg_opt += ' class="svg_text"';

		//svg_opt += 'style="z-index: -1; visibility: hidden; "';
		
		// TODO: put this to path and add a circle when a 3 step polygon is ignored
		if (svg_text == "KH" || svg_text == "VE"){
			//add circle around 
			//svg_g_add += '<circle cx="1000" cy="1000" r="110" stroke="black" stroke-width="10" fill="none" />';
			
			// TEXT Position
			text_opt += ' x="0" y="200"';
			
		}else{		
			// TEXT Position
			text_opt += ' x="0" y="200"';
		}
		
		//TEXT
		svg_g_add += '<text '+text_opt+' >'+svg_text+'</text>';
		
		var svg_div = "<svg "+svg_opt+"><g "+svg_g_opt+">"+svg_g_add+"</g>"+svg_add+"</svg>";
		
		//if (svg_text == "KH" || svg_text == "VE"){
			//print(svg_div);
			//print(entitie);
		//}
		
		//print(svg_div);
		
		const svgIcon = L.divIcon({
		html: svg_div,	
		  className: "", //not-clickable
		  iconSize: [250, 1000],
		  iconAnchor: [10, 200],
		});
		
		//popup with details
		const markerPopup = L.popup().setContent(svg_text);

		//create marker
		var marker = L.marker([point.lat, point.lng], {icon: svgIcon, rotationAngle: rotation, zIndexOffset: -2000, className:"not-clickable"}); //.bindPopup(markerPopup); //.addTo(map); //title:svg_text, 

		//marker.icon.classList.add("not-clickable");

		// add entitie obj to marker
		marker['entitie'] = entitie;
		marker['center_point'] = point;

		// add element to zoom list
		//const element = {marker: marker, entitie: entitie};

		//zoomElements.push(element);
        //layer_details.push(marker)
		
		
		if (type=='pipe'){
			layer_pipes_details.push(marker)

			if (svg_text == "KH" || svg_text == "VE" || svg_text == "E"){
				layer_pipes.push(marker)
			}
		}
		
		if (type=='border'){
			layer_bounds_details.push(marker)
		}
		
		/*
		color: 16777215		​
		colorIndex: 7		​
		handle: "A9"		​
		layer: "RW-KOPF"		​
		ownerHandle: "1"		​
		rotation: 558.778		​
		startPoint: Object { x: 3358490.643856, y: 5807425.570544, z: 0 }		​
		text: "KMR DN100/200"		​
		lineweight: 35
		textHeight: 0.8		​
		type: "TEXT"		​
		xScale: 1.2
		*/
		
		return;
	}
	
	
	//POINT
	if (entitie.type == "POINT"){
		//Point -> nur ein Punkt
		
		//get coordination
		var point = XYtoLatLng(entitie.position.x, entitie.position.y);
		
		//set marker
		//var marker = L.marker([point.lat, point.lng], {title: 'Point: ' + entitie.handle}).addTo(map);
		
		var popupText = "<b>x</b>: " + entitie.position.x.toFixed(3) + "<br><b>y</b>: " + entitie.position.y.toFixed(3) + "<br><b>z</b>: " + entitie.position.z.toFixed(3);
		//popupText += "<br><br><b>Lat</b>: " + point.lat.toFixed(6) + "<br><b>Lng</b>: " + point.lng.toFixed(6)
		
		const markerPopup = L.popup({autoClose: false, closeOnClick: false}).setContent(popupText);
		
		//var marker = L.circleMarker([point.lat, point.lng], {color: 'black', radius: 0.5}).bindPopup(markerPopup).addTo(map);
        //layer_bounds.push(L.circleMarker([point.lat, point.lng], {color: 'black', radius: 0.5}).bindPopup(markerPopup));
		
		//var point_marker = L.circleMarker([point.lat, point.lng], {color: 'black', radius: 1, riseOnHover: true, zIndexOffset: 20000}).bindPopup(markerPopup);

		//FIX: CircleMarker is overlayed by Text and Popup is blocked.
		//Point Marker is replaced by SVG_Point

		var svg_div = svgIcons['point'];
		
		//print(svg_div);
		
		var icon_factor = 1;
		
		const svgIcon = L.divIcon({
		html: svg_div,
		  className: "svg_icon",
		  iconSize: [10, 10],
		  //iconAnchor: [15*entitie.xScale, 15*entitie.yScale],
		  iconAnchor: [5, 10],
		});
	
		//print(svgIcon);
		
		var point_marker = L.marker([point.lat, point.lng], {icon:svgIcon, riseOnHover:true}).bindPopup(markerPopup); //.addTo(map); //title:entitie.name,


		if (type=='pipe'){
			layer_pipes_details.push(point_marker);
		}
		
		if (type=='border'){
			layer_bounds_details.push(point_marker);
		}		
		
		/*
		color: 16777215​
		colorIndex: 7		​
		handle: "5A"		​
		layer: "RW-KOPF"		​
		lineweight: 25		​
		ownerHandle: "1"		​
		position: Object { x: 3358512.493948, y: 5807434.225962, z: 0 }		​
		type: "POINT"
		*/
		
		return;
	}
	
	
	//INSERT ICON
	if (entitie.type == "INSERT"){
		//INSERT SVG
		
		// is element on ICON IGNORE list?
		if(dxf_icon_ignore_list.includes(entitie.name)){
			//skip this icon
			return;
		}
		
		// get coordination
		var point = XYtoLatLng(entitie.position.x, entitie.position.y);
		
		//set marker
		//L.marker([point.lat, point.lng], {title: 'Insert: ' + entitie.name}).addTo(map);
		
		//var zoomFactor = 24 - zoomLevel;
		
		var popupText = "<b>x</b>: " + entitie.position.x.toFixed(3) + "<br><b>y</b>: " + entitie.position.y.toFixed(3) + "<br><b>z</b>: " + entitie.position.z.toFixed(3);
		//popupText += "<br><br><b>Lat</b>: " + point.lat.toFixed(6) + "<br><b>Lng</b>: " + point.lng.toFixed(6)
		
		//Popup
		const markerPopup = L.popup({autoClose: false, closeOnClick: false}).setContent( popupText);
		
		var rotate = 0;
		
		if ("rotation" in entitie){
			rotate = -entitie.rotation +180;
		}
		
		//print(entitie);
		//print(rotate);
		
		//rotate += rotation_offset;
		
		
		//rotation correct S33 Icon orientation  (Dreieck)
		if (entitie.name == "S33"){
			rotate += 180;
		}
		
		// Pfeil rotation coorection
		if (entitie.name == "S180"){
			rotate += 180;
		}
		
		//if (entitie.name == "S67"){}
		
		var svg_div = svgIcons[entitie.name]?.replace("rotate(0)", "rotate(" + rotate + ")");
		
		//print(svg_div);
		
		var icon_factor = 1;
		
		const svgIcon = L.divIcon({
		html: svg_div,
		  className: "svg_icon",
		  iconSize: [100*entitie.xScale, 100*entitie.yScale],
		  //iconAnchor: [15*entitie.xScale, 15*entitie.yScale],
		  iconAnchor: [50*entitie.xScale, 50*entitie.yScale],
		});
	
		//print(svgIcon);
		
		var marker = L.marker([point.lat, point.lng], {icon:svgIcon, riseOnHover:true}).bindPopup(markerPopup); //.addTo(map); //title:entitie.name,
        
		// add entitiie to marker
		marker['entitie'] = entitie;
		marker['center_point'] = point;
        
		//layer_details.push(marker);
		
		if (type=='pipe'){
			layer_pipes_details.push(marker);
			if (entitie.name == "S240"){
				layer_pipes.push(marker);
			}
		}
		
		if (type=='border'){
			layer_bounds_details.push(marker);
		}

        //layer_details.push(L.marker([point.lat, point.lng], {title: entitie.name, icon: svgIcon }).bindPopup(markerPopup));
		
		//const element = {marker: marker, entitie: entitie};		
		//zoomElements.push(element);
		
		//Bilder unter dxf_json.blocks.<name> -> SVG oder Polyline
		
		//entitie.rotation
		/*
		color: 16777215​
		colorIndex: 7		​
		handle: "9B"		​
		layer: "RW-KOPF"		​
		lineweight: 35		​
		name: "S67"		​
		ownerHandle: "1"		​
		position: Object { x: 3358521.298106, y: 5807437.627513, z: 0 }		​
		rotation: 288.7130000000001		​
		type: "INSERT"		​
		xScale: 0.8		​
		yScale: 0.8		​
		zScale: 0.8
		*/
		return;
	}
	
	
	//ARC
	if (entitie.type == "ARC"){
		
		//print(entitie);
		
		// get coordination
		var point = XYtoLatLng(entitie.center.x, entitie.center.y);
		
		//set marker
		//L.marker([point.lat, point.lng], {title: 'Insert: ' + entitie.name}).addTo(map);
		
		var steps = Math.round(entitie.angleLength)*2;
		//TODO: Step calc by distance
		
		//print(steps);
		
		var vertices = getArcPoints(entitie.center.x, entitie.center.y, entitie.radius, -entitie.startAngle, -entitie.endAngle, steps);
		
		var points = [];

		// add points to list
		for (var i = 0; i < vertices.length; i++){
		 
			var point = XYtoLatLng(vertices[i][0], vertices[i][1]);
		 
			points.push([point.lat, point.lng]);			
			
			//L.marker([point.lat, point.lng], {title: 'Insert: ' + entitie.name}).addTo(map);
		}
		
		//print(points);
		
		//lineType: "Continuous"   default
		var dashArray = null;
		var dashOffset = null;
		var opacity = 1;
		var weight = 3;

		//lineType: "STPUNKT1"
		if (entitie.lineType == "STPUNKT1"){
			dashArray = '20, 20';
			dashOffset = '0';
		}
		
		//dashArray = '10, 10';
		
		var polyline = L.polyline(points, {color: color, dashArray: dashArray, dashOffset: dashOffset, opacity: opacity, weight:weight});

		if (type=='border'){
			layer_bounds.push(polyline);
		}

		if (type=='pipe'){
			layer_pipes.push(polyline);			
		}
		
		/*
		angleLength: 1.0259918007848667		​
		endAngle: 4.3474379541671375
		startAngle: 3.321446153382271		​
		radius: 0.363361	
		center: Object { x: 3367551.5975, y: 5763284.3375, z: 0 }		​
		color: 16711680		​
		colorIndex: 1		​		​
		handle: "1C4"		​
		layer: "5"		​
		lineType: "Continuous"		​
		lineweight: 50		​
		ownerHandle: "1"
		type: "ARC"
				
		*/
		
		return;
	}
	
	//CIRCLE TODO: Popup is not visiable -> change to Circle ICON
	if (entitie.type == "CIRCLE"){
		
		// get coordination
		var point = XYtoLatLng(entitie.center.x, entitie.center.y);
		
		//set marker
		//L.marker([point.lat, point.lng], {title: entitie.type}).addTo(map);
		
		//Popup
		var popupText = "<b>x</b>: " + entitie.center.x.toFixed(3) + "<br><b>y</b>: " + entitie.center.y.toFixed(3) + "<br><b>z</b>: " + entitie.center.z.toFixed(3);
		const markerPopup = L.popup({autoClose: false, closeOnClick: false}).setContent( popupText);
		
		//CIRCLE
		var circ_marker = L.circle([point.lat, point.lng], {radius: entitie.radius/2, fill: false, color: color}).bindPopup(markerPopup); //.addTo(map);
				
		//print(circ_marker);
		
		if (type=='border'){
			layer_bounds_details.push(circ_marker);
		}

		if (type=='pipe'){
			layer_pipes_details.push(circ_marker);					
		}

		//close 
		return;
	}

	print('unkown entitie');
	print(entitie);
}

// convert UTM coordination XY to Lat Long dec deg coordination
function XYtoLatLng(x, y, zone=33, band='u', southHemi=false){

	// coordinatoion coorection 
	// delete the first 3 of the UTM coordinats
	if (x > 3000000) {
		x = x - 3000000;
	}
	
	var utm = L.utm(x, y, zone, band, southHemi);
	
	//short digits
	//console.log(utm.latLng().lat.toFixed(9))
	
	var latLng = utm.latLng();
	
	// get min max view bounds from all coordinates
	find_view_bounds(latLng.lat, latLng.lng);
	
	return latLng;	
}

function LatLngtoXY(lat, lng, zone=33, southHemi=false){
	
	return L.latLng(lat, lng).utm();
}

// read Icon from DXF_JSON file and convert it to SVG
function readIcon(name, block) {

	//print(block.name.indexOf("*"));

	//TODO: Pflei weniger line width

	//ignore non icons
	if (block.name.indexOf("*") == -1){
		//print(name);
		//print(block);
		
		//print(block.entities);
		
		var svg_elements = '';
		
		for (var i = 0; i < block.entities.length; i++){
			var item = block.entities[i];
		
			if (item.type == "CIRCLE"){
				//item.radius
				//item.center.x
				
				svg_elements += "<circle cx=\"" + item.center.x + "\" cy=\"" + item.center.y + "\" r=\"" + item.radius + "\" stroke=\"black\" stroke-width=\"0.1\" fill=\"none\" />\n";
				
			}
		
			if (item.type == "LINE"){
		
				var line_start 	= item.vertices[0];
				var line_end 	= item.vertices[1];
			
				svg_elements += "<line x1=\"" + line_start.x + "\" y1=\"" + line_start.y + "\" x2=\"" + line_end.x + "\" y2=\"" + line_end.y + "\" style=\"stroke:rgb(0,0,0);stroke-width:0.05\" />\n";
			}
			
			//todo Circle
		}
		
		var svg_options = '';
		
		//svg_options += 'style=\"border: 1px solid #000000;\" ';
		svg_options += "transform=\"rotate(0)\" ";
		
		//transform=\"scale(2)\"
		//preserveAspectRatio=\"xMidYMid meet\"
		//style=\"stroke: #000000; fill:none;\"
		//width=\"40\" height=\"40\"
		//viewBox=\"0 0 100 100\"
		//transform=\"rotate(15)\"
		
		var svg = "<svg preserveAspectRatio=\"xMidYMid meet\" viewBox=\"-0.6 -0.6 1.2 1.2\" version=\"1.1\" " + svg_options + "  >\n " + svg_elements + "</svg>";
		
		//save obj
		svgIcons[name] = svg;
		
		//print(svg);
		//print(svgIcon);
	}
}

//parse the DXF_JSON files
function parse_dxf(dxf_json, type, rotation_offset=0){
	
	//read ICONS from blocks
	const blocks = dxf_json.blocks;
	
	//read blocks and create SVGs
	block_names = Object.keys(dxf_json.blocks);
	
	// read blocklist and create Icons
	for (var i = 0; i < block_names.length; i++){
		//print(block_names[i]);
		//print(dxf_json.blocks[block_names[i]]);
		readIcon(block_names[i], dxf_json.blocks[block_names[i]]);
	}

	//print(svgIcons);
	
	//read Entities
	const entities = dxf_json.entities;

	//prind all lines	
	for (var i = 0; i < entities.length; i++){
		print_entitie(entities[i], type, rotation_offset);
		
	}
	
}


//TODO: load JSONs with async
// read border DXF files
for (var i = 0; i < dxf_border_files.length; i++){
	parse_dxf(dxf_border_files[i], 'border');
}

//read pipes DXF files
for (var i = 0; i < dxf_pipes_files.length; i++){
	parse_dxf(dxf_pipes_files[i], 'pipe', 10);
}


// hide elements outside the map
function hide_elements(e){

	//get zoom
	var currentZoom = map.getZoom();
	
	//get bounds
	var map_bounds = map.getBounds();
	
	//print(currentZoom);
	//print(map_bounds);
	
	
	//hide blue pipe hat low zoom
	/*
	layer_pipes.forEach(function(e){
		
		if(e.options.color != "#ff0000"){
			if(currentZoom>18){
				if(layer_pipes_group.hasLayer(e)){
					layer_pipes_group.removeLayer(e);
				}
			}else{
				layer_pipes_group.addLayer(e);
			}
		}		
	});
	*/

	//BOUNDS		
	if (currentZoom > 16){
		layer_bounds.forEach(function(e){
					
			// is element in view?
			if (!is_point_in_bound(e, map_bounds)){
				//hide element
				if (layer_bounds_group.hasLayer(e)){
					//remove element
					layer_bounds_group.removeLayer(e);
					//print('remove Layer');
				}					
			}else{
				//add element
				layer_bounds_group.addLayer(e);
			}		
		});	
	}else{
		//clear groupLayer
		layer_bounds_group.clearLayers();		
	}

	//BOUNDS DETAILS
	if (currentZoom > 18){
	
		layer_bounds_details.forEach(function(e){
			//print(e['_latlng']['lat']);				
			//print(e.getBounds())
			
			// is element in view?
			if (!is_point_in_bound(e, map_bounds)){
				//hide element
				//print('hide');
				if (layer_bounds_detail_group.hasLayer(e)){
					//remove element
					layer_bounds_detail_group.removeLayer(e);
					//print('remove Layer');
				}
				
			}else{
				//add element
				layer_bounds_detail_group.addLayer(e);
			}			
		});	
	}else{
		//clear groupLayer
		layer_bounds_detail_group.clearLayers();		
	}	
	
	
	//PIPES
	layer_pipes.forEach(function(e){
				
		// two points
		if('_latlngs' in e){
			point = e['_latlngs'];
		}
			
		// is element in view?
		//if (!is_point_in_bound(e, map_bounds)){
		if (!is_point_in_bound(e, map_bounds) || (e.options.color != "#ff0000" && currentZoom<19)		) {

			
			//hide element
			//print('hide');
			if (layer_pipes_group.hasLayer(e)){
				//remove element
				layer_pipes_group.removeLayer(e);
				//print('remove Layer');
			}					
		}else{
			//add element
			layer_pipes_group.addLayer(e);
		}		
	});	
	
	
	//PIPES DETAILS
	if (currentZoom > 19){
	
		layer_pipes_details.forEach(function(e){
				
			// is element in view?
			if (!is_point_in_bound(e, map_bounds)){
				//hide element
				//print('hide');
				if (layer_pipes_details_group.hasLayer(e)){
					//remove element
					layer_pipes_details_group.removeLayer(e);
					//print('remove Layer');
				}
				
			}else{
				//add element
				layer_pipes_details_group.addLayer(e);
			}			
		});	
	}else{
		//clear groupLayer
		layer_pipes_details_group.clearLayers();		
	}
	
	//resize the new elements
	zoom_coorection();
}


// Zoom coorection
function zoom_coorection(){
	
	//hide_elements();
	
	var currentZoom = map.getZoom();
		
	print('ZoomLevel: ' + currentZoom.toString());
	// ZoomLevel: 23=2m; 22=5m; 21=10m; 20=20m; 19=30m; 18=50m; 17=100m
	
	//2D table zoomLevel to zoomFactor and Text offset
	// 2m / 5m = 0,4 = 40%
	const zoomTable = {
		23: [1, 	0],		//2m	100%
		22: [0.5, 	1000],	//5m	40%		//0,5		1000
		21:	[0.25, 	3000],	//10m	20%		//0.25, 	3000
		20: [0.125,	7000],	//20m	10%		//0.125,	7000
		19: [0,		0],		//30m	6.6%	//0.133,	8000
		18: [0, 	0],		//50m	4%
		17: [0, 	0],		//100m	2%
		16: [0,		0],		//to small
	};
	
	//limit currentZoom
	if (currentZoom < 16){
		currentZoom = 16;
	}
	
	//var zoomFactor = 24 - currentZoom;
	var zoomFactor = zoomTable[currentZoom][0];
	
	//var offsetCorrection = 0.5 * (zoomFactor - 1);
	
	//var new_zoomElements = [];
	
	//for pipe details
	const zoomAnchorFactorTable = {
		//[+=left, +=up]
		23: [0, 	0],		//2m	100%
		22: [0, 	2],		//5m	40%		//0,5		1000
		21:	[-1, 	4],		//10m	20%		//0.25, 	3000
		20: [0, 	8],		//20m	10%		//0.125,	7000
		19: [0, 	0],		//30m	6.6%	//0.133,	8000
		18: [0, 	0],		//50m	4%
		17: [0, 	0],		//100m	2%
		16: [0, 	0],		//to small
	}

	var offsetFactor = zoomAnchorFactorTable[currentZoom];
	
	//PIPE DETAILS
	layer_pipes_details.forEach(function(e){

		var icon =  e.options.icon;
		
		if ("entitie" in e){
		
			if (e.entitie.type == "INSERT"){
			
				//update icon size
				var x_iconSize = Math.round(100 * e.entitie.xScale * zoomFactor)
				var y_iconSize = Math.round(100 * e.entitie.yScale * zoomFactor)
				icon.options.iconSize = [x_iconSize, y_iconSize];
				//icon.options.iconAnchor= [(x_iconSize/2), (y_iconSize/2)];	// + offsetCorrection + zoomFactor
				icon.options.iconAnchor= [(x_iconSize/2+offsetFactor[0]), (y_iconSize/2+offsetFactor[1])];	

				if(e.entitie.name == "S180"){
					//icon.options.iconAnchor= [(x_iconSize/2+offsetFactor[0]), (y_iconSize/2+offsetFactor[1])];	
					icon.options.iconAnchor= [(x_iconSize/2), (y_iconSize/2)];	// + offsetCorrection + zoomFactor
				}
			
			}
			
			
			/* Dont work -> check
			if (e.entitie.type == "TEXT"){
				
				print('text');
				
				//update icon size
				var x_iconSize = Math.round(1000 * zoomFactor)
				var y_iconSize = Math.round(200 * zoomFactor)
				icon.options.iconSize = [x_iconSize, y_iconSize];
			}
			*/
			
			//update marker
			e.setIcon(icon);
		}
	});
	
	
	
	//BOUNDS
	layer_bounds_details.forEach(function(e){
	
		var icon =  e.options.icon;
		
		if ("entitie" in e){
		
			if (e.entitie.type == "INSERT"){
			
				//uodate icon size
				var x_iconSize = Math.round(110 * e.entitie.xScale * zoomFactor)
				var y_iconSize = Math.round(110 * e.entitie.yScale * zoomFactor)
				icon.options.iconSize = [x_iconSize, y_iconSize];

				//const iconSize = Math.round(110 * e.entitie.xScale * zoomFactor )
				//icon.options.iconSize = [iconSize, iconSize];
				//icon.options.iconAnchor= [iconSize / 2, (iconSize / 2)];	//+ offsetCorrection  + zoomFactor
				icon.options.iconAnchor= [(x_iconSize/2+offsetFactor[0]), (y_iconSize/2+offsetFactor[1])];	
			}
			
			//update marker
			e.setIcon(icon);
		}
		
	});
	
	
	//find svg Text
	var elements = document.getElementsByClassName('svg_text');
			
	//print(elements);
			
	var scale = 1 * zoomFactor;
	var translate = zoomTable[currentZoom][1]; // 1000 * (zoomFactor);
	
	//print(zoomFactor);
	//print(scale);
	//print(translate);	
	
	//TODO FIX cutted BIG Text -> change table to 2000px to
	const text_tansform = {
		//zoomLevel [tranform X, Y]
		23: [0, 	0],		//2m	100%
		22: [-490, 	73],	//5m	40%		//0,5		1000
		21:	[-1470,	225],	//10m	20%		//0.25, 	3000
		20: [-3440,	530],	//20m	10%		//0.125,	7000
		19: [0,		0],		//30m	6.6%	//0.133,	8000
		18: [0, 	0],		//50m	4%
		17: [0, 	0],		//100m	2%
		16: [0,		0],		//to small
	};
				
	//hide elements
	for(var i=0; i<elements.length; i++){

		//if (currentZoom > 19){
			//elements[i].style.fontSize = Math.round(65 / (zoomFactor * 1.2)) + "px";
			
			elements[i].setAttribute('transform', 'scale('+scale+','+scale+') translate('+ text_tansform[currentZoom][0] +',' + text_tansform[currentZoom][1] + ')');
			//elements[i].setAttribute('transform', 'scale('+scale+','+scale+')');
			//elements[i].style.visibility= "visible";
			
		//}
		//else
		//{
		//	elements[i].style.visibility= "hidden";
		//}			
	};
	
	//print(elements);
	/*
	//find svg Icon
	var elements = document.getElementsByClassName('svg_icon');
			
	//print(elements);
			
	for(var i=0; i<elements.length; i++){

		if (currentZoom > 20){
			elements[i].style.visibility= "visible";
		}
		else
		{
			elements[i].style.visibility= "hidden";
		}			
	};
	*/	
}
	


//center map
//print(dxf_pipes_files[0].tables.viewPort.viewPorts[0].center); //

//var center_point = XYtoLatLng(dxf_pipes_files[0].tables.viewPort.viewPorts[0].center.x, dxf_pipes_files[0].tables.viewPort.viewPorts[0].center.y);
//map.setView([center_point.lat, center_point.lng], 16);

//print('bound');
//print( JSON.stringify(view_bounds));


//fitBounds(<LatLngBounds> bounds, <fitBounds options> options?)
map.fitBounds([
    [view_bounds.x1, view_bounds.y1],
    [view_bounds.x2, view_bounds.y2]
]);



// /*

// Layer

var layer_bounds_group 			= L.layerGroup(); //.addTo(map); //layerGroup_bounds); //.addTo(map);
var layer_bounds_detail_group 	= L.layerGroup(); //.addTo(map); //layerGroup_bounds_details); //.addTo(map);

var layer_pipes_group 			= L.layerGroup().addTo(map); //layerGroup_pipes).addTo(map);
var layer_pipes_details_group 	= L.layerGroup(); //.addTo(map); //layerGroup_pipes_details); //.addTo(map);

// init action
//zoom_correction();
//zoom_coorection();
hide_elements();

//call hide_elements if a layer is added
layer_bounds_detail_group.on('add', hide_elements);
layer_pipes_details_group.on('add', hide_elements);

// hide text during zoom
function hide_text(){
	var elements = document.getElementsByClassName('svg_text');
	
	for(var i=0; i < elements.length; i++){
		elements[i].style.visibility= "hidden";
	}
}

//map.on('zoomend', hide_elements);
map.on('moveend', hide_elements);
map.on('zoomstart', hide_text);


layer_bounds_group.on('add', function(){		layer_bounds_detail_group.addTo(map)});
layer_bounds_group.on('remove', function(){	layer_bounds_detail_group.remove(map)});

var mouse_ccor_div = ''; // '<div id="mouse_coordinates">test</div>';

var map_osm_white = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: mouse_ccor_div + '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxNativeZoom:20,
    maxZoom:23
}).addTo(map);

//MAPS
var map_osm = L.tileLayer(
	//'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 		//Open Street Map
	//'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',  // SAT Bilder
	{
        //attribution: '&copy; <a href="http://www.example.com/">Example</a>',
		attribution: mouse_ccor_div +'&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxNativeZoom:19,
        maxZoom:23
	}
);

var map_sat = L.tileLayer(
	//'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 		//Open Street Map
	'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',  // SAT Bilder
	{
		attribution: mouse_ccor_div + '&copy; <a href="https://arcgisonline.com">ArcGIS contributors</a>',
        maxNativeZoom:19,
        maxZoom:23
	}
);

var baseLayers = {
    "Karte (hell)": map_osm_white,
	//"Karte weiß2": map_osm_white2,
	"Karte": map_osm,	
    "Satellitenbild": map_sat,
    //"gSat": googleSat
};

var overlays = {
	//"Grenzen-Details": 	layer_bounds_detail_group,
	
	//"Leitung": 			layer_pipes_group,
	//Text and more details
    "Details": 			layer_pipes_details_group,
	//Höhen und Trassierung 
	//TODO: "Höhen":			layer_pipes_details_group,
	//Borders from seperate DXF
	"Grenzen": 			layer_bounds_group,
    
};

//add LAyercontroll button
L.control.layers(baseLayers, overlays).addTo(map);


// Add Center Buttons
L.easyButton( '<span class="icon_center" title="Reset View">&square;</span>', function(){ // &square;   
	//reset Map view
	map.fitBounds([
		[view_bounds.x1, view_bounds.y1],
		[view_bounds.x2, view_bounds.y2]
	]);
}).addTo(map);
//*/


/* watermark
L.Control.Watermark = L.Control.extend({
    onAdd: function(map) {
        //var img = L.DomUtil.create('img');

        //img.src = '../../docs/images/logo.png';
        //img.style.width = '200px';

        //return img;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomleft' }).addTo(map);
*/


///*

var positionWatchId;
var positionButton;

// Add Follow Me Buttons
L.easyButton( '<span style="hight:16px" class="icon_center" title="Center on my Position">&hercon;</span>', function(btn){ 
	
	positionButton = btn;
	
	if (follow_location){
		
		navigator.geolocation.clearWatch(positionWatchId);
		follow_location_marker.remove();
		follow_location_circle.remove();
		//diable
		follow_location = false;
		
		btn.button.style.backgroundColor = 'white';
	}else{		
		//enable
		follow_location = true;
		
		//ask for current position
		if (navigator && navigator.geolocation) {
			
			follow_location_marker.addTo(map);
			follow_location_circle.addTo(map);
			
			//navigator.geolocation.getCurrentPosition(showPosition, errorPositionCallback);
			
			positionWatchId = navigator.geolocation.watchPosition(showPosition, errorPositionCallback, {enableHighAccuracy:true,timeout:60000,maximumAge:500});
			
			btn.button.style.backgroundColor = '#88FF88';
		} else {
		   print("Geolocation is not supported by this browser.");
		   btn.button.style.backgroundColor = 'gray';
		}		
	}
}).addTo(map);


//show current position
//ToDo: ask for position every 10 secs and show point on map
//if distance is to fare away from project coodirnation dont show location
function showPosition(position) {
    
	if (follow_location){
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var err = position.coords.accuracy;
		var dir = position.coords.heading; //TODO: show current direction at position
		//heading, speed, 
		
		follow_location_marker.setLatLng([lat, lng]);
		follow_location_circle.setLatLng([lat, lng]);
		follow_location_circle.setRadius(err);
		
		map.setView([lat, lng], map.getZoom());
		
		//print(position);
		print(
		"Latitude: " + lat + "\n" +
		"Longitude: " + lng + "\n" +
		"Genauigkeit: " + err + "m\n"
		);
	}
} 

function errorPositionCallback(){
	follow_location = false;
	print('Position not supported.')
	positionButton.button.style.backgroundColor = 'gray';
}

/*
function open_popups(){
	
	layer_pipes_details.forEach(function(e){
		e.openPopup();
	});
	
	//layer_pipes_details_group.openPopup();
}
open_popups();
*/



// call locate every 3 seconds... forever
    //setInterval(locate, 3000);
//*/

/* //show coordinates in the corner
L.control.coordinates({
	//position:"bottomleft", //optional default "bootomright"
	decimals:5, //optional default 4
	//decimalSeperator:".", //optional default "."
	labelTemplateLat:"Lat: {y}", //optional default "Lat: {y}"
	labelTemplateLng:"Lng: {x}", //optional default "Lng: {x}"
	enableUserInput:false, //optional default true
	useDMS:false, //optional default false
	useLatLngOrder: false, //ordering of labels, default false-> lng-lat
	markerType: L.marker, //optional default L.marker
	markerProps: {}, //optional default {},
	//labelFormatterLng : function(lng){return "Long: " + lng.toFixed(5)}, //optional default none,	LatLngtoXY(0, lng).x
	//labelFormatterLat : function(lat){return "Lat: " + lat.toFixed(5)}, //optional default none
	
	//TODO: XY hat eine offset. ka warum
	labelFormatterLng : function(lng){return "x: 3" + (LatLngtoXY(52.00, lng).x).toFixed(0)}, //optional default none,	LatLngtoXY(0, lng).x
	labelFormatterLat : function(lat){return "y: " + (LatLngtoXY(lat, 13.1).y).toFixed(0)}, //optional default none
	
	//customLabelFcn: function(latLonObj, opts) { "Geohash: " + encodeGeoHash(latLonObj.lat, latLonObj.lng)} //optional default none
}).addTo(map);
*/

//Then add an event listener for mouse move:
/*
this.leafletMap.addEventListener('mousemove', (event) => {
    let lat = Math.round(event.latlng.lat * 100000) / 100000;
    let lng = Math.round(event.latlng.lng * 100000) / 100000;
    this.position.updateHTML(lat, lng);
  }
});
*/

//show obj
//print(dxf_border_files);
//print(dxf_pipes_files);

//print('Pipe Distance [km]:');
//print(distance_sum/1000)

