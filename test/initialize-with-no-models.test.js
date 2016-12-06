/**
 * Module dependencies
 */

var assert = require('assert');
var _ = require('lodash');
var Sails = require('sails').Sails;



describe('initialize() with no models and no adapters', function (){

  // New up an instance of Sails.
  var app = new Sails();

  // Load the app.
  before(function setup(done){
    app.load({
      globals: false,
      log: { level: 'warn' },
      hooks: {
        // Inject the orm hook in this repo into this Sails app
        "orm-offshore": require('../')
      },
      loadHooks: ['moduleloader', 'userconfig', 'orm-offshore']
    },done);
  });


  it('should have initialized the `orm-offshore` hook', function (){
    assert(app.hooks['orm-offshore']);
  });

  it('should have set up a dictionary of models on the hook', function (){
    assert(_.isObject(app.hooks['orm-offshore'].models) && !_.isArray(app.hooks['orm-offshore'].models));
  });

  it('should have set up a dictionary of adapters on the hook', function (){
    assert(_.isObject(app.hooks['orm-offshore'].adapters) && !_.isArray(app.hooks['orm-offshore'].adapters));
  });

  it('should have also exposed `sails.models` as a direct reference to `sails.hooks[\'orm-offshore\'].models`', function (){
    assert(app.models === app.hooks['orm-offshore'].models);
  });


  // Lower the app.
  after(function teardown(done) {
    app.lower(done);
  });

});
