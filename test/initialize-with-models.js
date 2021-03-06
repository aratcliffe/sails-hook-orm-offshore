/**
 * Module dependencies
 */

var assert = require('assert');
var _ = require('lodash');
var Sails = require('sails').Sails;



describe('initialize() with model(s)', function (){


  describe('without the appropriate adapter(s)', function (){

    it('should fail to load the orm-offshore hook', function (done){

      // New up an instance of Sails.
      var app = new Sails();

      // Load the app.
      app.load({
        globals: false,
        log: { level: 'silent' },
        hooks: {
          // Inject the orm hook in this repo into this Sails app
          "orm-offshore": require('../')
        },
        loadHooks: ['moduleloader', 'userconfig', 'orm-offshore'],
        connections: {
          pretendDatabase: {
            adapter: 'sails-pretend-adapter-that-totally-does-not-exist'
          }
        },
        orm: {
          // THIS IS FOR EXPERIMENTAL USE ONLY!
          // (could change at any time)
          moduleDefinitions: {
            models: {
              foo: {
                connection: 'pretendDatabase'
              }
            }
          }
        }
      },function (err) {
        if (err) {
          // Ensure this error was due to the orm hook failing to load--
          // and specifically that the proper error code was sent back.
          if (err.code === 'E_ADAPTER_NOT_INSTALLED') {
            return done();
          }
          else {
            // console.log(err.code,_.keys(err), err.stack);
            return done(new Error('Expected `E_ADAPTER_NOT_INSTALLED`, but got a different error: \n'+err.stack+'\n(for ^^^, error code is `'+err.code+'`'));
          }
        }

        // If we're here, then Sails loaded successfully, even though it should have
        // failed to load.  So we lower the Sails app to prevent it from interfering
        // with other tests.
        app.lower(function (err) {
          if (err) {
            console.log(' -- NOTE --\nAn **unrelated** error occurred while attempting to lower Sails:',err);
          }
          return done(new Error('Should have failed to load the ORM hook.'));
        });
      });
    });
  });//</without the appropriate adapter(s)>





  describe('with the appropriate adapter(s) and `migrate: safe`', function (){

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
        loadHooks: ['moduleloader', 'userconfig', 'orm-offshore'],
        connections: {
          default: {
            adapter: 'offshore-memory'
          }
        },
        models: {
          migrate: 'safe'
        },
        orm: {
          // THIS IS FOR EXPERIMENTAL USE ONLY!
          // (could change at any time)
          moduleDefinitions: {
            models: {
              foo: {
                connection: 'default',
                primaryKey: 'id',
                attributes: {
                  id: {
                    type: 'number'
                  }
                }
              }
            },
            adapters: {
              'offshore-memory': {}
            }
          }
        }
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

    it('should contain the expected models in `sails.hooks[\'orm-offshore\'].models`', function (){
      assert.equal(_.keys(app.models).length, 1);
      assert(_.isObject(app.models.foo), new Error('Should have a model under the `foo` key'));
    });


    // Lower the app.
    after(function teardown(done) {
      app.lower(done);
    });

  });//</with the appropriate adapter(s)>


});
