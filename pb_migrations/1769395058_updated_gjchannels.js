/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number2565575827",
    "max": null,
    "min": null,
    "name": "refreshRate",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // remove field
  collection.fields.removeById("number2565575827")

  return app.save(collection)
})
