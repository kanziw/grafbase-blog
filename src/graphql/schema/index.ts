import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Game = {
  __typename?: 'Game';
  id: Scalars['ID'];
  linkUrl: Scalars['String'];
  logoImageUrl: Scalars['String'];
  name: Scalars['String'];
  slug: Scalars['String'];
};

export type GameConnection = {
  __typename?: 'GameConnection';
  edges?: Maybe<Array<Maybe<GameEdge>>>;
  /** Information to aid in pagination */
  pageInfo: PageInfo;
};

/** Input to create a new Game */
export type GameCreateInput = {
  linkUrl: Scalars['String'];
  logoImageUrl: Scalars['String'];
  name: Scalars['String'];
  slug: Scalars['String'];
};

export type GameCreatePayload = {
  __typename?: 'GameCreatePayload';
  game?: Maybe<Game>;
};

export type GameDeletePayload = {
  __typename?: 'GameDeletePayload';
  deletedId: Scalars['ID'];
};

export type GameEdge = {
  __typename?: 'GameEdge';
  cursor: Scalars['String'];
  node: Game;
};

export type GameScore = {
  __typename?: 'GameScore';
  game: Game;
  id: Scalars['ID'];
  score: Scalars['Int'];
  user: User;
};

export type GameScoreConnection = {
  __typename?: 'GameScoreConnection';
  edges?: Maybe<Array<Maybe<GameScoreEdge>>>;
  /** Information to aid in pagination */
  pageInfo: PageInfo;
};

/** Input to create a new GameScore */
export type GameScoreCreateInput = {
  game: GameScoreGameRelateGameScoreGameCreateRelationInput;
  score: Scalars['Int'];
  user: GameScoreGameScoreRelateUserUserCreateRelationInput;
};

export type GameScoreCreatePayload = {
  __typename?: 'GameScoreCreatePayload';
  gameScore?: Maybe<GameScore>;
};

export type GameScoreDeletePayload = {
  __typename?: 'GameScoreDeletePayload';
  deletedId: Scalars['ID'];
};

export type GameScoreEdge = {
  __typename?: 'GameScoreEdge';
  cursor: Scalars['String'];
  node: GameScore;
};

/** Input to create a new GameScoreGameRelateGameScoreGame */
export type GameScoreGameRelateGameScoreGameCreateInput = {
  linkUrl: Scalars['String'];
  logoImageUrl: Scalars['String'];
  name: Scalars['String'];
  slug: Scalars['String'];
};

/** Input to create a new GameScoreGameRelateGameScoreGame relation */
export type GameScoreGameRelateGameScoreGameCreateRelationInput = {
  create?: InputMaybe<GameScoreGameRelateGameScoreGameCreateInput>;
  link?: InputMaybe<Scalars['ID']>;
};

/** Input to update a GameScoreGameRelateGameScoreGame relation */
export type GameScoreGameRelateGameScoreGameUpdateRelationInput = {
  create?: InputMaybe<GameScoreGameRelateGameScoreGameCreateInput>;
  link?: InputMaybe<Scalars['ID']>;
  unlink?: InputMaybe<Scalars['ID']>;
};

/** Input to create a new GameScoreGameScoreRelateUserUser */
export type GameScoreGameScoreRelateUserUserCreateInput = {
  email: Scalars['String'];
  name: Scalars['String'];
};

/** Input to create a new GameScoreGameScoreRelateUserUser relation */
export type GameScoreGameScoreRelateUserUserCreateRelationInput = {
  create?: InputMaybe<GameScoreGameScoreRelateUserUserCreateInput>;
  link?: InputMaybe<Scalars['ID']>;
};

/** Input to update a GameScoreGameScoreRelateUserUser relation */
export type GameScoreGameScoreRelateUserUserUpdateRelationInput = {
  create?: InputMaybe<GameScoreGameScoreRelateUserUserCreateInput>;
  link?: InputMaybe<Scalars['ID']>;
  unlink?: InputMaybe<Scalars['ID']>;
};

/** Input to create a new GameScore */
export type GameScoreUpdateInput = {
  game?: InputMaybe<GameScoreGameRelateGameScoreGameUpdateRelationInput>;
  score?: InputMaybe<Scalars['Int']>;
  user?: InputMaybe<GameScoreGameScoreRelateUserUserUpdateRelationInput>;
};

export type GameScoreUpdatePayload = {
  __typename?: 'GameScoreUpdatePayload';
  gameScore?: Maybe<GameScore>;
};

/** Input to create a new Game */
export type GameUpdateInput = {
  linkUrl?: InputMaybe<Scalars['String']>;
  logoImageUrl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  slug?: InputMaybe<Scalars['String']>;
};

export type GameUpdatePayload = {
  __typename?: 'GameUpdatePayload';
  game?: Maybe<Game>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a Game */
  gameCreate?: Maybe<GameCreatePayload>;
  /** Delete a Game by ID */
  gameDelete?: Maybe<GameDeletePayload>;
  /** Create a GameScore */
  gameScoreCreate?: Maybe<GameScoreCreatePayload>;
  /** Delete a GameScore by ID */
  gameScoreDelete?: Maybe<GameScoreDeletePayload>;
  /** Update a GameScore */
  gameScoreUpdate?: Maybe<GameScoreUpdatePayload>;
  /** Update a Game */
  gameUpdate?: Maybe<GameUpdatePayload>;
  /** Create a User */
  userCreate?: Maybe<UserCreatePayload>;
  /** Delete a User by ID */
  userDelete?: Maybe<UserDeletePayload>;
  /** Update a User */
  userUpdate?: Maybe<UserUpdatePayload>;
};

export type MutationGameCreateArgs = {
  input: GameCreateInput;
};

export type MutationGameDeleteArgs = {
  id: Scalars['ID'];
};

export type MutationGameScoreCreateArgs = {
  input: GameScoreCreateInput;
};

export type MutationGameScoreDeleteArgs = {
  id: Scalars['ID'];
};

export type MutationGameScoreUpdateArgs = {
  id: Scalars['ID'];
  input: GameScoreUpdateInput;
};

export type MutationGameUpdateArgs = {
  id: Scalars['ID'];
  input: GameUpdateInput;
};

export type MutationUserCreateArgs = {
  input: UserCreateInput;
};

export type MutationUserDeleteArgs = {
  id: Scalars['ID'];
};

export type MutationUserUpdateArgs = {
  id: Scalars['ID'];
  input: UserUpdateInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  /** Get Game by ID */
  game?: Maybe<Game>;
  /** Paginated query to fetch the whole list of `Game`. */
  gameCollection?: Maybe<GameConnection>;
  /** Get GameScore by ID */
  gameScore?: Maybe<GameScore>;
  /** Paginated query to fetch the whole list of `GameScore`. */
  gameScoreCollection?: Maybe<GameScoreConnection>;
  /** Get User by ID */
  user?: Maybe<User>;
  /** Paginated query to fetch the whole list of `User`. */
  userCollection?: Maybe<UserConnection>;
};

export type QueryGameArgs = {
  id: Scalars['ID'];
};

export type QueryGameCollectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type QueryGameScoreArgs = {
  id: Scalars['ID'];
};

export type QueryGameScoreCollectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type QueryUserArgs = {
  id: Scalars['ID'];
};

export type QueryUserCollectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  /** Information to aid in pagination */
  pageInfo: PageInfo;
};

/** Input to create a new User */
export type UserCreateInput = {
  email: Scalars['String'];
  name: Scalars['String'];
};

export type UserCreatePayload = {
  __typename?: 'UserCreatePayload';
  user?: Maybe<User>;
};

export type UserDeletePayload = {
  __typename?: 'UserDeletePayload';
  deletedId: Scalars['ID'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String'];
  node: User;
};

/** Input to create a new User */
export type UserUpdateInput = {
  email?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UserUpdatePayload = {
  __typename?: 'UserUpdatePayload';
  user?: Maybe<User>;
};

export type GameFragment = { __typename?: 'Game', id: string, slug: string, name: string, linkUrl: string, logoImageUrl: string };

export type GamesQueryVariables = Exact<{ [key: string]: never; }>;

export type GamesQuery = { __typename?: 'Query', gameCollection?: { __typename?: 'GameConnection', edges?: Array<{ __typename?: 'GameEdge', node: { __typename?: 'Game', id: string, slug: string, name: string, linkUrl: string, logoImageUrl: string } } | null> | null } | null };

export const GameFragmentDoc = { kind: 'Document', definitions: [{ kind: 'FragmentDefinition', name: { kind: 'Name', value: 'Game' }, typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Game' } }, selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }, { kind: 'Field', name: { kind: 'Name', value: 'slug' } }, { kind: 'Field', name: { kind: 'Name', value: 'name' } }, { kind: 'Field', name: { kind: 'Name', value: 'linkUrl' } }, { kind: 'Field', name: { kind: 'Name', value: 'logoImageUrl' } }] } }] } as unknown as DocumentNode<GameFragment, unknown>
export const GamesDocument = { kind: 'Document', definitions: [{ kind: 'OperationDefinition', operation: 'query', name: { kind: 'Name', value: 'Games' }, selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'gameCollection' }, arguments: [{ kind: 'Argument', name: { kind: 'Name', value: 'first' }, value: { kind: 'IntValue', value: '100' } }], selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'edges' }, selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'node' }, selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Game' } }] } }] } }] } }] } }, ...GameFragmentDoc.definitions] } as unknown as DocumentNode<GamesQuery, GamesQueryVariables>
