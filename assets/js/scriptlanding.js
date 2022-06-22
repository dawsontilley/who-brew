var googlekey = 'AIzaSyA5ury2VC7bslPGGb5hP-9OUTPdMF1fiIY';

document.querySelector('.letsgobtn').addEventListener('click', () => {
	document.querySelector('.modal').classList.add('is-active');
    document.querySelector('.error').classList.remove('is-active');
    document.querySelector('.zipinput').value = '';
    localStorage.clear();
});

document.querySelector('.zipbtn').addEventListener('click', () => {
	var zipCode = document.querySelector('.zipinput').value;
    var cityname;
	// get city name
    var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&sensor=true&key=${googlekey}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        cityname = data.results[0].address_components[2].short_name;
        lastIndexOfSpace = cityname.lastIndexOf(' ');
        if (lastIndexOfSpace === -1) {
            cityname = cityname;
        }
        else {
            cityname = cityname.substring(0, lastIndexOfSpace);
        }
        var city = [];
        city.push(zipCode);
        city.push(cityname);
        console.log(city);
        localStorage.setItem('city',JSON.stringify(city));
	    document.querySelector('.modal').classList.remove('is-active');
        window.location = './search.html';
    })
    .catch(()=>{
        document.querySelector('.error').classList.remove('is-hidden');
    })
});

window.onload = function(){
    if(localStorage.getItem('update')==='true'){
        console.log('should have been clicked')
        document.querySelector('.letsgobtn').click();
    }
};