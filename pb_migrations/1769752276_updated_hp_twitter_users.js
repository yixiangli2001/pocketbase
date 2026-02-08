/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1345037371")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select3975874327",
    "maxSelect": 1,
    "name": "sourceColletion",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "twitter_user_posts"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1345037371")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select3975874327",
    "maxSelect": 1,
    "name": "sourceColletion",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "twitter"
    ]
  }))

  return app.save(collection)
})
