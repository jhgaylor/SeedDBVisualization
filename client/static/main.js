// console.log("Bower is ready", $, d3);

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
      }
    });
  },
  company: function (obj) {
    return _.extend(obj, {

    })
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
})() // the first comment on this line prevents the examples from running

// draw the appropriate visualization - use routing?
// click events on visualization
