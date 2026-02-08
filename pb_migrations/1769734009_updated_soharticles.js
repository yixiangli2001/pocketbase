/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2916607988")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_7aDXhvb809` ON `soharticles` (`articleId`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1061607967",
    "max": 0,
    "min": 0,
    "name": "sourceUrl",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number1061607967",
    "max": null,
    "min": null,
    "name": "articleId",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2916607988")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_7aDXhvb809` ON `soharticles` (`sourceUrl`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("text1061607967")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number1061607967",
    "max": null,
    "min": null,
    "name": "sourceUrl",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
