$(document).ready(function () {
  $('#search-button,#history').on('click', function () {
    let clickEvent = $(event.target)[0];
    let location = "";
    if (clickEvent.id === "search-button") {
      location = $('#city-input').val().trim().toUpperCase();
    } else if (clickEvent.className === ("cityList")) {
      location = clickEvent.innerText;
    }
    if (location == "") return;
    updateLocalStorage(location);
    getCurrentWeather(location);
    getForecastWeather(location);
  });

  function convertDate(UNIXtimestamp) {
    let convertedDate = "";
    let a = new Date(UNIXtimestamp * 1000);
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    convertedDate = month + ' ' + date + ', ' + year;
    return convertedDate;
  }

  function updateLocalStorage(location) {
    let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
    cityList.push(location);
    cityList.sort();
    for (let i = 1; i < cityList.length; i++) {
      if (cityList[i] === cityList[i - 1]) cityList.splice(i, 1);
    }
    localStorage.setItem('cityList', JSON.stringify(cityList));
    $('#city-input').val("");
  }
  function getCurrentWeather(loc) {

    let cityList = JSON.parse(localStorage.getItem("cityList")) || [];

    $('#history').empty();

    cityList.forEach(function (city) {
      let cityHistoryNameDiv = $('<div>');
      cityHistoryNameDiv.addClass("cityList");
      cityHistoryNameDiv.attr("value", city);
      cityHistoryNameDiv.text(city);
      $('#history').append(cityHistoryNameDiv);
    });

    $('#city-search').val("");

    if (typeof loc === "object") {
      city = `lat=${loc.latitude}&lon=${loc.longitude}`;
    } else {
      city = `q=${loc}`;
    }

    var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
    var cityName = city;
    var unitsURL = "&units=imperial";
    var apiIdURL = "&appid="
    var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
    var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;

    $.ajax({
      url: openCurrWeatherAPI,
      method: "GET"
    }).then(function (response1) {

      weatherObj = {
        city: `${response1.name}`,
        wind: response1.wind.speed,
        humidity: response1.main.humidity,
        temp: Math.round(response1.main.temp),
        date: (convertDate(response1.dt)),
        icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
        desc: response1.weather[0].description
      }
      $('#forecast').empty();
      $('#cityName').text(weatherObj.city + " (" + weatherObj.date + ")");
      $('#currWeathIcn').attr("src", weatherObj.icon);
      $('#temperature').text("Temperature: " + weatherObj.temp + " " + "°F");
      $('#humidity').text("Humidity: " + weatherObj.humidity + "%");
      $('#wind-speed').text("Windspeed: " + weatherObj.wind + " MPH");

      city = `&lat=${parseInt(response1.coord.lat)}&lon=${parseInt(response1.coord.lon)}`;

      var uviURL = "https://api.openweathermap.org/data/2.5/uvi";
      var apiIdURL = "?appid="
      var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
      var cityName = city;
      var openUviWeatherAPI = uviURL + apiIdURL + apiKey + cityName;

      $.ajax({
        url: openUviWeatherAPI,
        method: "GET"
      }).then(function (response3) {

        let UviLevel = parseFloat(response3.value);
        let backgrdColor = 'violet';
        if (UviLevel < 3) { backgrdColor = 'green'; }
        else if (UviLevel < 6) { backgrdColor = 'yellow'; }
        else if (UviLevel < 8) { backgrdColor = 'orange'; }
        else if (UviLevel < 11) { backgrdColor = 'red'; }
        let uviTitle = '<span>UV Index: </span>';
        let color = uviTitle + `<span style="background-color: ${backgrdColor}; padding: 0 7px 0 7px;">${response3.value}</span>`;
        $('#currUVI').html(color);
      });
    });
  }
  function getForecastWeather(loc) {

    if (typeof loc === "object") {
      city = `lat=${loc.latitude}&lon=${loc.longitude}`;
    } else {
      city = `q=${loc}`;
    }

    var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
    var cityName = city;
    var unitsURL = "&units=imperial";
    var apiIdURL = "&appid="
    var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
    var openCurrWeatherAPI2 = currentURL + cityName + unitsURL + apiIdURL + apiKey;

    $.ajax({
      url: openCurrWeatherAPI2,
      method: "GET",
    }).then(function (response4) {

      var cityLon = response4.coord.lon;
      var cityLat = response4.coord.lat;

      city = `lat=${cityLat}&lon=${cityLon}`;

      let weatherArr = [];
      let weatherObj = {};
      var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
      var cityName = city;
      var exclHrlURL = "&exclude=hourly";
      var unitsURL = "&units=imperial";
      var apiIdURL = "&appid=";
      var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
      var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + apiKey;

      $.ajax({
        url: openFcstWeatherAPI,
        method: "GET"
      }).then(function (response2) {

        for (let i = 1; i < (response2.daily.length - 2); i++) {
          let cur = response2.daily[i]
          weatherObj = {
            weather: cur.weather[0].description,
            icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
            minTemp: Math.round(cur.temp.min),
            maxTemp: Math.round(cur.temp.max),
            humidity: cur.humidity,
            uvi: cur.uvi,
            date: (convertDate(cur.dt))
          }

          weatherArr.push(weatherObj);
        }

        for (let i = 0; i < weatherArr.length; i++) {
          let $colmx1 = $('<div class="col mx-1">');
          let $cardBody = $('<div class="card-body forecast-card">');
          let $cardTitle = $('<h6 class="card-title">');
          $cardTitle.text(weatherArr[i].date);
          let $ul = $('<ul>');
          let $iconLi = $('<li>');
          let $iconI = $('<img>');
          let $weathLi = $('<li>');
          let $tempMaxLi = $('<li>');
          let $tempMinLi = $('<li>');
          let $humLi = $('<li>');
          $iconI.attr('src', weatherArr[i].icon);
          $weathLi.text(weatherArr[i].weather);
          $tempMaxLi.text('Temp High: ' + weatherArr[i].maxTemp + " °F");
          $tempMinLi.text('Temp Low: ' + weatherArr[i].minTemp + " °F");
          $humLi.text('Humidity: ' + weatherArr[i].humidity + "%");
          $iconLi.append($iconI);
          $ul.append($iconLi);
          $ul.append($weathLi);
          $ul.append($tempMaxLi);
          $ul.append($tempMinLi);
          $ul.append($humLi);
          $cardTitle.append($ul);
          $cardBody.append($cardTitle);
          $colmx1.append($cardBody);
          $('#forecast').append($colmx1);
        }
      });
    });
  }
});