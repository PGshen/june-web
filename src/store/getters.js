const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  errorLogs: state => state.errorLog.logs,
  // role manager
  roleList: state => state.role.roles,
  // user manager
  userList: state => state.users.users,
  // menu manager
  menuTree: state => state.menu.menuTree,
  menuList: state => state.menu.menuList,
  permList: state => state.permission.permList
}
export default getters
