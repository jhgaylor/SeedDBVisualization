// console.log("Bower is ready", $, d3);

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
