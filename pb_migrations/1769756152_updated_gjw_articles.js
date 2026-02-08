/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1978749714")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "date3807506514",
    "max": "",
    "min": "",
    "name": "pubDate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1978749714")

  // remove field
  collection.fields.removeById("date3807506514")

  return app.save(collection)
})
