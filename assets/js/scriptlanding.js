var googlekey = 'AIzaSyA5ury2VC7bslPGGb5hP-9OUTPdMF1fiIY';

document.querySelector('.letsgobtn').addEventListener('click', () => {
	document.querySelector('.modal').classList.add('is-active');
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
        cityname = data.results[0].address_components[1].short_name;
        var city = [];
        city.push(zipCode);
        city.push(cityname);
        console.log(city);
        localStorage.setItem('city',JSON.stringify(city));
	    document.querySelector('.modal').classList.remove('is-active');
    })
    .catch(()=>{
        document.querySelector('.error').classList.remove('is-hidden');
    })
});
