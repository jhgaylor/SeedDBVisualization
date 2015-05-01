This project is an example of how to use a package written to use big-cheese inside of an application.

The end result is a simple d3 visualization of the data provided by `SeedDBCommands` from [seed-db](http://seed-db.com).

Please keep in mind this project is a proof of concept of several ideas and is not intended to be "used" by anyone. Feel free to fork and tinker, but know that it is not "stable" or even "pretty".

This was my first time working with Bower and D3. It is the second application to use the concepts made available in big-cheese but the first project that used a package built on top of big-cheese.

# Install

Please note that this has only been tested on io.js 1.7.1. A dependency, zombie, requires io.js (well, really I think it requires some of ecmascript 6 that just isn't available in node yet.)

```sh
npm install -g grunt-cli
git clone https://github.com/jhgaylor/SeedDBVisualization
cd SeedDBVisualization

npm install
bower install
grunt
```

# Run

You need a redis instance to make this work. You can set environment variables `BIG_CHEESE_REDIS_HOST` and `BIG_CHEESE_REDIS_PORT` or just run it on `localhost:6379` 

```sh
iojs index.js
```

# add bower components

```sh
bower install <component> --save
grunt # recompile assets
```
