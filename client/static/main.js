// Some sites that helped
// https://github.com/mbostock/d3/wiki/Pie-Layout
// https://github.com/mbostock/d3/wiki/SVG-Shapes
// http://bl.ocks.org/mbostock/3887193
// https://github.com/mbostock/d3/wiki/Ordinal-Scales

// models here just gives the data from the API some methods.
// there is no writing/modifying so this can be really simple
// and is definitely not an ORM.
var Models = {
  accelerator: function (obj) {
    // in this order, we're injecting the 2nd object into the original `obj` and returning it.
    return _.extend(obj, {
      _companies: null, // cache api results
      // returns a promise for the companies of this accelerator
      getCompanies: function () {
        // returned the cached value if it exists
        if (this._companies) {
          return this._companies;
        }
        var accelerator_id = this.seeddb_url.split("=")[1];
        return APIWrapper.getAcceleratorCompanies(accelerator_id);
      },
      // sets a property at run time
      fundingNumber: (function () {
        return Number(obj.funding.replace(/,/g, ''));
      })()
    });
  },
  company: function (obj) {
    return _.extend(obj, {

    });
  }
};

// a hash table of views of data. Essentially, it is a collection
// of methods that can take a set of either accelerators or companies
// (depending on the slicer) and returns a new arrangement of the data
var Slicers = {
  // returns a hashtable of {bracket_name: [accelerators]}
  // where brackets are:
  //    0: >$1B
  //    1: >$100M<$1B
  //    2: >$25M<$100M
  //    3: >$10M<$25M
  //    4: >$2M<$10M
  //    5: <$2M
  a_funding_brackets: function (accelerators) {
    var brackets = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };
    function numberToBracketKey (num) {
      if (num >= 1000000000) {
        return 0;
      } else if (num >= 100000000) {
        return 1;
      } else if (num >= 25000000) {
        return 2;
      } else if (num >= 10000000) {
        return 3;
      } else if (num >= 2000000) {
        return 4;
      } else {
        return 5;
      }
    }
    accelerators.forEach(function (accelerator) {
      // console.log(accelerator.funding);
      // console.log(accelerator.funding.replace(/,/g, ''));
      // console.log(accelerator.funding);
      var funding = accelerator.fundingNumber
      // don't display accelerators that haven't funded anything.
      if (funding < 1) {
        return;
      }
      var key = numberToBracketKey(funding);
      brackets[key].push(accelerator);
    });
    return brackets;
  }
}

// a client side consumer of the API wrapping SeedDBCommands
var APIWrapper = {
  base_url: "http://localhost:3000/api",
  get: function (url_partial) {
    var def = Q.defer();
    var full_url = this.base_url + url_partial;
    $.get(full_url)
      .done(function (data) {
        def.resolve(data);
      })
      .fail(function () {
        def.reject({error: "AJAX Failed.", url: full_url});
      });
    return def.promise;
  },
  getAccelerators: function () {
    // returns a promise for the array of accelerator models
    return this.get('/accelerators')
      .then(function (accelerators) {
        return accelerators.map(function (accelerator) {
          return Models.accelerator(accelerator);
        });
      });
  },
  getAcceleratorCompanies: function (acceleratorId) {
    // returns a promise for the array of company models
    return this.get('/accelerators/'+acceleratorId)
      .then(function (companies) {
        return companies.map(function (company) {
          return Models.company(company);
        });
      });
  },
  getExits: function (company) {
    // returns a promise for the array of company models
    return this.get('/exits')
      .then(function (companies) {
        return companies.map(function (company) {
          return Models.company(company);
        });
      });
  }
};

// Example usage of APIWrapper
(function () {
  APIWrapper.getAccelerators().then(function (accelerators) {
    console.log("Accelerators", accelerators);
    var brackets = Slicers.a_funding_brackets(accelerators);
    console.log("brackets", brackets);
  })
  .catch(function(err) {
    console.log(err);
  });

  APIWrapper.getAcceleratorCompanies(1011).then(function (companies) {
    console.log("companies", companies);
  })
  .catch(function(err) {
    console.log(err);
  });

  APIWrapper.getExits().then(function (companies) {
    console.log("exits", companies);
  })
  .catch(function(err) {
    console.log(err);
  });

  APIWrapper.getAccelerators().then(function (accelerators) {
    accelerators[0].getCompanies().then(function (companies) {
      console.log(companies);
    })
  })
  .catch(function(err) {
    console.log(err);
  });
});//(); // the first comment on this line prevents the examples from running

// Render the d3 visualization of accelerators' fund size
$(document).ready(function () {

  // find if the screen is limited by height or width and set both the svg's height and width to the largest contraint to allow for scrolling either horizontally or vertically depending on screen realestate.
  var largestContainer = _.max([$('#accelerator_visualization').height(), $('#accelerator_visualization').width()])
  var svgWidth = largestContainer;
  var svgHeight = largestContainer;
  var svgRadius = Math.min(svgWidth, svgHeight) / 2;
  // an array of hex values. (ordinal scale)
  var color = d3.scale.category10();

  // create a function that can convert a set of accelerators
  // into the start and end angles needed.
  var pie = d3.layout.pie()
    .value(function (datum) { return datum.fundingNumber; })
  // insert the svg into the body
  var svg = d3.select("#accelerator_visualization").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
  // move the origin over and down half the size of the visualization
  // basically this puts the top and left sides at the top left of it's container
  // instead of the origin at the top left
  .append("g")
    .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");

  // the general idea is to render 6 donuts, each subsequently larger in radius
  // and further from the center.

  // Grab the accelerators models
  APIWrapper.getAccelerators().then(function (accelerators) {
    // Break the accelerators into brackets
    var brackets = Slicers.a_funding_brackets(accelerators);
    // console.log(brackets)
    // the distance between inner and outer radius
    // which is totalRadius/numberOfBrackets
    var numberOfBrackets = _.keys(brackets).length;
    var totalAvailableRadius = svgRadius-2;
    var arc_width = totalAvailableRadius/numberOfBrackets
    // render each bracket into a donut. the index of the bracket
    // indicates where the donut should be drawn (0 is inner most)
    _.each(brackets, function (bracket, key) {
      var keyNumber = Number(key);
      // get the bracket accelerators into the proper form
      // which is pairs of name, and funding. this will be fed to d3.layout.pie
      // which (i believe) is where i'll bind click events?
      var outerRadius = (keyNumber+1)*arc_width+2;
      var innerRadius = keyNumber*arc_width+2;
      // console.log(keyNumber, outerRadius, innerRadius)
      var arc = d3.svg.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius);

      var svgGroup = svg.selectAll('.funding-arc'+key)
        .data(pie(bracket))
        .enter().append("g")
          .attr('class', "arc funding-arc"+key)

      // create the path of the arc for each datum
      svgGroup.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(keyNumber); });

      // add the label
      svgGroup.append("text")
        // move the label to the center of the arc, instead of the origin of the visualization
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        // shift the content on the y axis
        .attr("dy", ".35em")
        // anchor the text to the middle of the arc
        .style("text-anchor", "middle")
        // set the text from the data
        .text(function(d) { return d.data.name; });
    });
  });
});

// click events on visualization
