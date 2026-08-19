
function print(text){
	console.log(text);
}

function special_char(text){
	
	text = text.replaceAll('%%223','ß');
	
	text = text.replaceAll('%%220','Ü');
	text = text.replaceAll('%%252','ü');
	
	text = text.replaceAll('%%214','Ö');
	text = text.replaceAll('%%246','ö');
	
	text = text.replaceAll('%%196','Ä');
	text = text.replaceAll('%%228','ä');
	
	text = text.replaceAll('%%d','°');
	text = text.replaceAll('%%c','&empty;');
	text = text.replaceAll('%%U','&empty;');
	
	// %%c30  durchmesser
	
	// Fernwärmeleitungsnetz
	// Internet: Fernwärme Leitungen
	
	return text;
	
}

function is_point_in_bound(elmt, bound, offset=0.0002){
		
	var points = [];
		
	// single point
	if('_latlng' in elmt){
		points.push(elmt['_latlng']);
		//points.push(elmt.getLatLng());
			//print('POINT');
		
		//print(elmt);
		//print(points);
		
		//return true;
	}
		
		// two points
	if('_latlngs' in elmt){
		points = elmt['_latlngs'];
			//print('BOUNDS:');			
			//print(e.getBounds());
			//points = elmt.getBounds();
			//print(elmt.getLatLngs());
		
			// [ { lat: 52.001867, lng: 13.06924 }, { lat: 52.001870045, lng: 13.069246 } ]
	}	

	if('center_point' in elmt){
		points = [elmt['center_point']];
	}
	
	if('add_view_point' in elmt){
		points.push(elmt['add_view_point']);
	}

	//print(points);
	
	
	//loop to all points
	for (let i = 0; i < points.length; i++) {
		//print('CALC');
		//print(points[i]);
		
		//return true;
		
		// get point
		var point = points[i];
		//print(point);
		
		//lat
		if (bound['_southWest']['lat']-offset <= point['lat'] && point['lat'] <= bound['_northEast']['lat']+offset){
			
			//long
			if(bound['_southWest']['lng']-offset <= point['lng'] && point['lng'] <= bound['_northEast']['lng']+offset){
				
				return true;
			}			
		}
		
		// is bound in line
		if (i > 0){
			var point1 = points[i-1];
			var point2 = points[i];
			
			//sort coordnates
			var lat_min = Math.min(point1['lat'], point2['lat']);
			var lat_max = Math.max(point1['lat'], point2['lat']);
			
			var lng_min = Math.min(point1['lng'], point2['lng']);
			var lng_max = Math.min(point1['lng'], point2['lng']);
			
			//lat
			if (lat_max >= bound['_southWest']['lat']-offset && lat_min <= bound['_southWest']['lat']+offset){
				return true;
			}
			
			//long
			if (lng_max >= bound['_southWest']['lng']-offset && lng_min <= bound['_southWest']['lng']+offset){
				return true;
			}			
		}		
	}
	
	return false;
		
	/*
	if (point.length == 1){
		//point.lat, .lng
		//bound[0] = SW
		//bound[1] = NE
		
		//lat
		if (point['lat'] >= bound['_southWest']['lat'] && point['lat'] <= bound['_northEast']['lat']){
			
			//long
			if(point['lng'] >= bound['_southWest']['lng'] && point['lng'] <= bound['_northEast']['lng']){
				
				//print(point);
				//print(bound);
				
				return true;
			}			
		}
	}
	
	if (point.length == 2) {
		//point[[lat, .lng], [lat, .lng]]

		//lat
		if ((point[0]['lat'] >= bound['_southWest']['lat'] && point[0]['lat'] <= bound['_northEast']['lat']) || (point[1]['lat'] >= bound['_southWest']['lat'] && point[1]['lat'] <= bound['_northEast']['lat'])) {
			
			//long
			if ((point[0]['lng'] >= bound['_southWest']['lng'] && point[0]['lng'] <= bound['_northEast']['lng']) || (point[1]['lng'] >= bound['_southWest']['lng'] && point[1]['lng'] <= bound['_northEast']['lng'])){
				
				//print(point);
				//print(bound);
				
				return true;
			}
		}
	}	

	if(point.length > 2){
		print(point.length);
		print(point);
	}
	*/

	//return false;
	//return true;
}


function createSvgArc(x, y, r, startAngle, endAngle) {
	if (startAngle > endAngle) {
	  var s = startAngle;
	  startAngle = endAngle;
	  endAngle = s;
	}
	if (endAngle - startAngle > Math.PI * 2) {
	  endAngle = Math.PI * 1.99999;
	}

	var largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;

	return [
	  "M",
	  //x,
	  //y,
	  //"L",
	  x + Math.cos(startAngle) * r,
	  y - Math.sin(startAngle) * r,
	  "A",
	  r,
	  r,
	  0,
	  largeArc,
	  0,
	  x + Math.cos(endAngle) * r,
	  y - Math.sin(endAngle) * r,
	  //"L",
	  //x,
	  //y
	].join(" ");
}


function getArcPoints(x, y, radius, startAngle, endAngle, steps=0){
	
	var points = []
	
	var angleSteps = [startAngle];
	
	var stepSize = 0;
	
	//var U = Math.PI * radius * 2;
	
	//steps = U * (endAngle - startAngle) / steps;
	
	//if (endAngle > startAngle){
		stepSize = (endAngle - startAngle) / steps;
	//}
	
	for(var i=0; i < steps; i++){
		
		angleSteps.push(startAngle + stepSize * (i+1));
		
	}
	
	angleSteps.push(endAngle);
	
	for(var i=0; i<angleSteps.length; i++){
		
		var new_x = x + Math.cos(angleSteps[i]) * radius;
		var new_y = y - Math.sin(angleSteps[i]) * radius;
		
		points.push([new_x, new_y]);		
	}
		
	return points;
}


function getRotatedPoint(x, y, angle, radius){
	
	var new_x = x + Math.cos(angle) * radius;
	var new_y = y - Math.sin(angle) * radius;
		
	return [new_x, new_y];		
}

// calc heading [deg] between from p1 to p2 (coordinate points)
function getHeading(p1_lat,p1_long,p2_lat, p2_long){
    var pi = Math.PI;
    var phi_1 = p1_lat * (pi/180);  // radian from deg
    var phi_2 = p2_lat * (pi/180);
    var delta_lambda = (pi/180) * (p2_long - p1_long);

    var y = Math.sin(delta_lambda) * Math.cos(phi_2);
    var x = Math.cos(phi_1) * Math.sin(phi_2) - Math.sin(phi_1) * Math.cos(phi_2) * Math.cos(delta_lambda);

    var theta = Math.atan2(y, x);

    var deg = ((theta * (180/pi)) + 360) % 360;

    return Math.round(deg * 10) / 10;
}

// calc distance [m] between two coordination points
function getDistance(p1_lat,p1_long,p2_lat, p2_long){
	
    var R = 6371e3;     // mean earth radius
    var pi = Math.PI;

    var lat1 = p1_lat * (pi/180);  // radian from deg
    var lat2 = p2_lat * (pi/180);

    var d_lat = (p2_lat - p1_lat) * (pi/180);
    var d_long = (p2_long - p2_long) * (pi/180);

    var a = Math.sin(d_lat / 2) * Math.sin(d_lat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(d_long / 2) * Math.sin(d_long / 2);
    var c = 2* Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var m = R * c;

    return Math.round(m * 100) / 100;
}



function getPointAngle(x1, y1, x2, y2) {
	return Math.atan2( y2 - y1, x2 - x1 ); // * ( 180 / Math.PI );
}

function getPointDistance(x1, y1, x2, y2){
	let y = x2 - x1;
    let x = y2 - y1;
    
    return Math.sqrt(x * x + y * y);
}