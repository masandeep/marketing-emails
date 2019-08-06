'use strict';

const _ = require('lodash');
const inventory = require('./inventory.json');

// Mock inventory from DB call
function getItemsFromInventory(req, res, next) {
    var saleidentifier, season, banner, items;

    saleidentifier = req.body.saleidentifier.toLowerCase();
    season = _.startsWith(saleidentifier, 'winter') ? 'winter' : 'summer';
    banner = inventory.banner[season];
    items = _.filter(inventory.items, {
        "category": season
    });
    req.inventory = {
        season: season,
        banner: banner,
        items: items
    }
    next();
}

module.exports = {
    getItemsFromInventory: getItemsFromInventory
}
