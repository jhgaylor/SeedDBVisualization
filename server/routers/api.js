var APIRouter = require('express').Router();
var SeedDBCommands = require('SeedDBCommands').Commands

APIRouter.route('/accelerators')
  .get(function (req, res) {
    // return a list of accelerators
    SeedDBCommands.accelerators.run()
      .then(function (accelerators) {
        res.status(200).json(accelerators);
      })
      .catch(function (err) {
        res.status(500).json({error: "Failed to retrieve accelerators data."});
      });
  });

APIRouter.route('/accelerators/:id')
  .get(function (req, res) {
    // return a list of companies for a given accelerator
    var accelerator_id = req.params.id;
    if (! accelerator_id) {
      res.status(400).json({error: "Please supply an accelerator_id"})
      return;
    }
    SeedDBCommands.accelerator_companies.run({accelerator_id: accelerator_id})
      .then(function (companies) {
        res.status(200).json(companies);
      })
      .catch(function (err) {
        res.status(500).json({error: "Failed to retrieve the companies data for accelerator_id " + accelerator_id});
      });
  });

APIRouter.route('/exits')
  .get(function (req, res) {
    // return a list of companies that have exited
    SeedDBCommands.exits.run()
      .then(function (companies) {
        res.status(200).json(companies);
      })
      .catch(function (err) {
        res.status(500).json({error: "Failed to retrieve exits data."});
      });
  });

module.exports = APIRouter;
