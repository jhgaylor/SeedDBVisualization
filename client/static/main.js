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
    var p = this.get('/accelerators');
    console.log(p);
    return p;
  },
  getAcceleratorCompanies: function (acceleratorId) {
    return this.get('/accelerators/'+acceleratorId);
  },
  getExits: function (company) {
    return this.get('/exits');
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
