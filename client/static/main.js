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
  //    "1B+": >$1B
  //    "100M-1B": >$100M<$1B
  //    "25M-100M": >$25M<$100M
  //    "10M-25M": >$10M<$25M
  //    "2M-10M": >$2M<$10M
  //    "2M-": <$2M
  a_funding_brackets: function (accelerators) {
    var brackets = {
      "1B+": [],
      "100M-1B": [],
      "25M-100M": [],
      "10M-25M": [],
      "2M-10M": [],
      "2M-": [],
    };
    function numberToBracketKey (num) {
      if (num >= 1000000000) {
        return "1B+";
      } else if (num >= 100000000) {
        return "100M-1B";
      } else if (num >= 25000000) {
        return "25M-100M";
      } else if (num >= 10000000) {
        return "10M-25M";
      } else if (num >= 2000000) {
        return "2M-10M";
      } else {
        return "2M-";
      }
    }
    accelerators.forEach(function (accelerator) {
      // console.log(accelerator.funding);
      // console.log(accelerator.funding.replace(/,/g, ''));
      // console.log(accelerator.funding);
      var funding = Number(accelerator.funding.replace(/,/g, ''));
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
})() // the first comment on this line prevents the examples from running

// draw the appropriate visualization - use routing?
// click events on visualization
