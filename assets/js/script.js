var repoList = document.querySelector('ul');
var fetchButton = document.getElementById("search");
var openweatherkey = '5047b93d8c8a3e00e320b778163f5545';
var googlekey = 'AIzaSyA5ury2VC7bslPGGb5hP-9OUTPdMF1fiIY';
let zipcode = '';
// `getApi` function is called when the `fetchButton` is clicked
var DataObj = {
	name: "",
	lat: "",
	lon: "",
	street: "",
	phone: "",
	url: "",
	city: "",
	state:"",
	type: "",
	postal_code:"",
  };

var result=[];
var markersArray = [];
var directionArray=[];
var display_city;
var display_id;
var timer;
var activeInfoWindow;
var map;
var display;
var services;
var current_lat;
var current_lon;

// create the city map
function drawmap(lat,lon)
{
    map = new google.maps.Map( document.getElementById( 'map'), {
    center: {
      lat: lat,
      lng: lon
    },
    zoom: 11
  });
}

// create or update the markers
function update_marker(){
  // Create markers.
  var match=-1;
  var cur_dis;
  for (let pos = 0; pos < result.length; pos++) {	
		for(var i=0;i < markersArray.length; i++) {
			if (result[pos].id==markersArray[i].id) match=i;	
		}
		if (pos==display_id) cur_dis=google.maps.Animation.BOUNCE;
		else cur_dis=null;
		if (match<0){
			marker=new google.maps.Marker({
				position: new google.maps.LatLng(result[pos].lat,result[pos].lon),
				id: pos,
				animation: cur_dis,
				map: map,
			});
			// create the DOM listener in Google map
			google.maps.event.addListener(marker, "click", (e) => {
				marker_click(pos);
			});
			google.maps.event.addListener(marker, "mouseover", (e) => {
				marker_over(pos);
			});
			google.maps.event.addListener(marker, "mouseout", (e) => {
				mouseout();
			});
				google.maps.event.addListener(marker,"touchstart",(e) => {
				marker_click(pos);
			});
			markersArray.push(marker);
		}
		else {	
			// update the existing marker animation status
			markersArray[match].setAnimation(cur_dis);
		}
  	}
}
//create the shop list
function Create_Button(){
	document.getElementById("history").remove();
	var newDiv = document.createElement("div");
	newDiv.className = "col-12 col-md-3:w-100  history";
	newDiv.id="history";
	for(i=0;i<result.length;i++){
		var newButton = document.createElement("button");
		newButton.textContent = result[i].name;
		newButton.className = 'btn btn-secondary w-100' ;
		newButton.id=i;
		newDiv.appendChild(newButton);
		if((result[i].lat==null)||(result[i].lon==null))
		check_postal_code(result[i].postal_code,i);
	}
	document.getElementById("shop_list").appendChild(newDiv);
	display_id=0;
	diaplay_shop_info(display_id);
	update_marker();	
	document.getElementById(display_id).setAttribute("style" , "color: black;");
 }

 //display the shop information in the shop detail window
 function diaplay_shop_info(id){	
	document.getElementById(display_id).setAttribute("style" , "color: white;");	
	document.getElementById(id).setAttribute("style" , "color: black;");
	document.getElementById("name").innerHTML=result[id].name;
	document.getElementById("address").innerHTML="Addr: "+result[id].street+" , "+result[id].city+" , "+result[id].state+", United State.";
	document.getElementById("phone").innerHTML="Phone: "+result[id].phone;
	document.getElementById("url").innerHTML=result[id].url;
	document.getElementById("url").herf=result[id].url;
	document.getElementById("type").innerHTML="Type: "+result[id].type;
	display_id=id;
 }

//Call the API and check the city geometry detail
function check_location(city_name) {
	display_city= city_name.charAt(0).toUpperCase() + city_name.slice(1);
	result=[];
	markersArray=[];
	var lat,lon;
  	var url= 'https://maps.googleapis.com/maps/api/geocode/json?address='+city_name+'&key='+googlekey;
	fetch(url)  
		.then(function(response) { 
		if (response.status >= 200 && response.status <= 299) {
		return response.json();
		} else {      
		throw Error(response.status+" "+response.statusText);
		}
		}) // Convert data to json
		.then(function(data) {
			// console.log(data);
			lat=data.results[0].geometry.location.lat;
			lon=data.results[0].geometry.location.lng;
			brewery_name(city_name);
		})
		.finally(function(){
			drawmap(lat,lon);
		})
		.catch(function(error) {
			// console.log(error);
		});
}

//check the geometry detail of the shop which does not have the Lat & Lon information
function check_postal_code(postal_code,pos) {
	var lat,lon;
	var url= 'https://maps.googleapis.com/maps/api/geocode/json?key='+googlekey+'&components=postal_code:'+postal_code;
	fetch(url)  
		.then(function(response) { 
			if (response.status >= 200 && response.status <= 299) {
		return response.json();
		} else {      
		throw Error(response.status+" "+response.statusText);
		}
		}) // Convert data to json
		.then(function(data) {
			if (pos>=0) {
				result[pos].lat=data.results[0].geometry.location.lat;
				result[pos].lon=data.results[0].geometry.location.lng;	
			}
			else	{				
				current_lat=data.results[0].geometry.location.lat;
				current_lon=data.results[0].geometry.location.lng;	
			}	
		})
		.finally(function(){
			if (pos<0) search_direction();
		})
		.catch(function(error) {
			// console.log(error);
		});
}

//Call API for getting the shop list of the city
function brewery_name(city_name){
	display_city= city_name.charAt(0).toUpperCase() + city_name.slice(1);
	result=[];
  	var url= 'https://api.openbrewerydb.org/breweries?by_city='+city_name.replace(" ","_")+'&per_page=12';

	fetch(url)  
	.then(function(response) { 
		if (response.status >= 200 && response.status <= 299) {
		return response.json();
		} else {      
		throw Error(response.status+" "+response.statusText);
		}
		}) // Convert data to json
		.then(function(data) {
			result=[];
			for(i=0;i<data.length;i++){
				DataObj = {
				id:i,
				name: data[i].name,
				lat: data[i].latitude,
				lon: data[i].longitude,
				street: data[i].street,
				phone: data[i].phone,
				url: data[i].website_url,
				city: data[i].city,
				state:data[i].state,
				type: data[i].brewery_type,
				postal_code: data[i].postal_code
			};
			result[i]=DataObj;
		}
		Create_Button();
	})
		.catch(function(error) {
			// console.log(error);
		});
	}


function historyButtonHandler(event){
	if (!isNaN(event.target.id)){
	diaplay_shop_info(event.target.id);
	update_marker();
	}
}

function searchButtonHandler(event){
	var cityName = JSON.parse(localStorage.getItem('city'));
	cityName = cityName[1];
	// console.log(cityName);
    check_location(cityName);
}

function marker_click(pos){
	var match;
	diaplay_shop_info(pos);
	update_marker();
}

function mouseout(){
	clearInterval(timer);
	activeInfoWindow.close();
}

function marker_over(pos){
	var infowindow = new google.maps.InfoWindow();
	infowindow.setContent('<h3 class="map header">'+result[pos].name+'</h3>');
	for(var i=0;i<result.length;i++){
		if (pos==markersArray[i].id) match=i;
	}
	infowindow.open(map, markersArray[match]);
	activeInfoWindow=infowindow;
	timer = setInterval(mouseout ,2000);
	
}


function search_direction() {
	var start = new google.maps.LatLng (current_lat,current_lon);
		var end = new google.maps.LatLng(result[display_id].lat, result[display_id].lon );
        display = new google.maps.DirectionsRenderer();
        services = new google.maps.DirectionsService();
		for (var i=0; i<directionArray.length; i++){
			directionArray[i].setMap(null);	
		}
		directionArray=[];
        display.setMap(map);
            var request ={
                origin : start,
                destination:end,
				drivingOptions: {
					departureTime: new Date(Date.now()),  // for the time N milliseconds from now.
					trafficModel: 'optimistic'
				  },
                travelMode: 'DRIVING'
            };

            services.route(request,function(response,status){
                if(status =='OK'){
                    display.setDirections(response);
					var route = response.routes[0];
					var leg = response.routes[0].legs[0];
					var polyline = route.overview_polyline;
					var distance = route.legs[0].distance.value;
					var duration = route.legs[0].duration.value;

				document.getElementById("route").innerHTML="<h3> Distance: "+distance/1000+"km  Time: "+(new Date(duration * 1000).toISOString().slice(11, 19))+"</h3>";
				var ex_list=document.querySelectorAll(".dl");
				// console.log(ex_list.length)
				for (var i=0; i< ex_list.length; i++){
					ex_list[i].remove();
				}

					for (var i=0; i< route.legs[0].steps.length; i++){
						var newli = document.createElement("li");
						newli.id="li"+i;
						newli.className="dl";
						newli.innerHTML = (route.legs[0].steps[i].instructions);
						// console.log(route.legs[0].steps[i].instructions);
						document.getElementById("direction").appendChild(newli);
					}
                }
            });
		directionArray.push(display);
    }

//modal

const searchBtn = document.querySelector('.searchBtn');
const zipInput = JSON.parse(localStorage.getItem('city'))[0];
document.querySelector('#zipInput').value = zipInput;


searchBtn.addEventListener('click', () => {
	// if((zipInput.value=='')||(isNaN(zipInput.value))){
	// 	alert('Please enter a valid Zip Code.');
	// }
	// else {
	// 	check_postal_code(zipInput.value,-1);
	// }
	// searchBtn.style.backgroundColor = 'rgb(180,83,9)';
	// searchBtn.style.color = '#ffc457';
	var zip = JSON.parse(localStorage.getItem('city'));
	check_postal_code(zip[0],-1);

})

//document.getElementById("abc").addEventListener('click', initMap);
window.onload = function (){
	fetchButton.click();
};
fetchButton.addEventListener('click', searchButtonHandler);
document.querySelector("#shop_list").addEventListener("click", historyButtonHandler);

document.querySelector('#update').addEventListener('click',()=>{
	localStorage.setItem('update','true');
	window.location = "./index.html";
})



