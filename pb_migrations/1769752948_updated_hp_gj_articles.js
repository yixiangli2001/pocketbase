/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1978749714")

  // update collection data
  unmarshal({
    "name": "gjw_articles"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1978749714")

  // update collection data
  unmarshal({
    "name": "hp_gj_articles"
  }, collection)

  return app.save(collection)
})
