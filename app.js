d3.queue()
  .defer(d3.json, '//unpkg.com/world-atlas@1.1.4/world/50m.json')
  .defer(d3.csv, './country_data.csv', function(row) {       // function(row) is formatter required to manipulate
    return {                                            // Data before send data to callBack ...   
      country: row.country,
      countryCode: row.countryCode,
      population: +row.population,
      medianAge: +row.medianAge,
      fertilityRate: +row.fertilityRate,
      populationDensity: +row.population / +row.landArea
    }
  })
  .await(function(error, mapData, populationData) {    // Await function just like call that waits for all request happen.
    if (error) throw error;                            // When formatter manipulate data then we it staerts works.

    var geoData = topojson.feature(mapData, mapData.objects.countries).features;
    							// a way of converting the topojson file into an geoJson file...

    populationData.forEach(row => {
      var countries = geoData.filter(d => d.id === row.countryCode);
      countries.forEach(country => country.properties = row);           
    });

    var width = 960;
    var height = 600;

    var projection = d3.geoMercator()        // Mercator projection is type of projection commony used for maps.
                       .scale(125)
                       .translate([width / 2, height / 1.4]);   // setting the map width and translate it.

    var path = d3.geoPath()
                 .projection(projection);    //.projection used to convert spherical plane onto 2-D plane.

    d3.select("svg")
        .attr("width", width)
        .attr("height", height)
      .selectAll(".country")
      .data(geoData)
      .enter()
        .append("path")
        .classed("country", true)
        .attr("d", path);

    var select = d3.select("select");            // Properties that we change on the basis of select..

    select
      .on("change", d => setColor(d3.event.target.value));

    setColor(select.property("value"));

    function setColor(val) {

      var colorRanges = {
        population: ["white", "purple"],
        populationDensity: ["white", "red"],
        medianAge: ["white", "black"],
        fertilityRate: ["black", "orange"]
      };

      var scale = d3.scaleLinear()
                    .domain([0, d3.max(populationData, d => d[val])])
                    .range(colorRanges[val]);

      d3.selectAll(".country")
          .transition()
          .duration(750)
          .ease(d3.easeBackIn)
          .attr("fill", d => {
            var data = d.properties[val];
            return data ? scale(data) : "#ccc";
          });
    }
  });

















