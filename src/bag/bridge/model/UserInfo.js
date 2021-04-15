export default class UserInfo {
  constructor(userId, name, userSeq, userM, email, success){
    this.userId = userId
    this.name = name
    this.userSeq = userSeq
    this.userM = userM
    this.email = email
    this.success = success
  }
  static from (result) {
    const {userId, name, userSeq, userM, email, success} = JSON.parse(result)
    return new UserInfo(userId, name, userSeq, userM, email, success)
  }
}
