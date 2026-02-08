/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2339016183")

  // remove field
  collection.fields.removeById("text2517783601")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select2517783601",
    "maxSelect": 1,
    "name": "sourceCollection",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "soharticles"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2339016183")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2517783601",
    "max": 0,
    "min": 0,
    "name": "sourceCollection",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("select2517783601")

  return app.save(collection)
})
