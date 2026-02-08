/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2916607988")

  // remove field
  collection.fields.removeById("text2766911014")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2916607988")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2766911014",
    "max": 0,
    "min": 0,
    "name": "articleId",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
