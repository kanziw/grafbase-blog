# miniapp-game-heaven

## References

### SpaceWorm

* Game: https://github.com/dancramp/js13k-2021
* Favicon: https://favicon.io/emoji-favicons/worm/
* Logo: DALL·E https://labs.openai.com/


## Firebase

Firestore 등의 변경이 필요하다면 수동으로 해당 룰 배포 진행이 필요

```shell
$ yarn firebase deploy
```

GitHub Action을 통해 자동화 해보려고 했는데 ServiceAccount에 Owner를 줘도 실패함. 나중에 더 디버깅

```shell
=== Deploying to 'miniapp-game-heaven'...

i  deploying firestore
i  firestore: reading indexes from firestore.indexes.json...
i  cloud.firestore: checking firestore.rules for compilation errors...

Error: HTTP Error: 403, The caller does not have permission
```
