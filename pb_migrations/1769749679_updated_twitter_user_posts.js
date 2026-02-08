/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2851578889")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_7u2VISv3lj` ON `twitter_user_posts` (`postId`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2851578889")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
