/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // update collection data
  unmarshal({
    "name": "gjw_channels"
  }, collection)

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select3563894552",
    "maxSelect": 2,
    "name": "contentType",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "posts",
      "videos",
      "shorts",
      "articles"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // update collection data
  unmarshal({
    "name": "gjchannels"
  }, collection)

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select3563894552",
    "maxSelect": 2,
    "name": "contentType",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "news",
      "posts",
      "videos",
      "shorts"
    ]
  }))

  return app.save(collection)
})
