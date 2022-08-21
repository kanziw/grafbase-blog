# miniapp-game-heaven

## References

### GraphQL with Grafbase
- nextjs example: https://github.com/grafbase/grafbase/tree/main/examples/nextjs

### SpaceWorm

* Game: https://github.com/dancramp/js13k-2021
* Favicon: https://favicon.io/emoji-favicons/worm/
* Logo: DALL·E https://labs.openai.com/

## Initial Data

```graphql
mutation AddSpaceWorm {
  gameCreate(
    input: {
      slug: "space-worm"
      name: "SpaceWorm"
      linkUrl: "/space-worm"
      logoImageUrl: "/images/space-worm.jpg"
    }
  ) {
    game {
      id
      slug
      name
      linkUrl
      logoImageUrl
    }
  }
}
```
