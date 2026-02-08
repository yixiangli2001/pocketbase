/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // update collection data
  unmarshal({
    "name": "gjchannels"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // update collection data
  unmarshal({
    "name": "channels"
  }, collection)

  return app.save(collection)
})
