/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2339016183")

  // update collection data
  unmarshal({
    "name": "hp_soh_posts"
  }, collection)

  // remove field
  collection.fields.removeById("relation3318513702")

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

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4272070894",
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2339016183")

  // update collection data
  unmarshal({
    "name": "homepage"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2916607988",
    "hidden": false,
    "id": "relation3318513702",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "articleID",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("text2517783601")

  // remove field
  collection.fields.removeById("text4272070894")

  return app.save(collection)
})
