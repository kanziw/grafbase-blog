import { userDb } from '../db'

// LoginFirst component를 이용하여 이미 로그인 여부가 Guard 되어있는 상태에서만 사용하는 것을 추천
export const useMe = () => {
  return { me: userDb().mustGetMe() }
}
