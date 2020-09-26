<template>
  <div class="app-container menu-container">
    <div class="left-bar">
      <el-card style="min-height: 100%">
        <div slot="header">
          <span style="line-height: 10px;">菜单结构</span>
        </div>
        <el-tree
          :data="menuTree"
          :props="menuProps"
          :highlight-current="true"
          accordion
          @node-click="handleNodeClick"
        />
      </el-card>
    </div>

    <div class="right-content">
      <el-card style="min-height: 100%">
        <div slot="header">
          <span style="line-height: 10px;">菜单列表</span>
        </div>
        <div class="body">
          <div class="filter-container">
            <el-button
              v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:menu:add') !== -1"
              class="filter-item"
              style="margin-left: 10px;"
              type="primary"
              icon="edit"
              @click="handleCreate"
            >
              添加
            </el-button>
            <el-button class="filter-item" type="primary" icon="document" @click="handleDownload">导出</el-button>
          </div>

          <el-table
            v-loading.body="listLoading"
            row-key="menuId"
            :data="displayList"
            border
            fit
            style="width: 100%"
          >

            <el-table-column align="center" label="序号" width="60" type="index">
              <!-- <template slot-scope="scope">
                <span>{{scope.row.id}}</span>
              </template> -->
            </el-table-column>

            <el-table-column min-width="150" label="菜单名称">
              <template slot-scope="scope">
                <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.menuName }}</span>
              </template>
            </el-table-column>

            <el-table-column min-width="150" label="中文显示">
              <template slot-scope="scope">
                <span>{{ scope.row.title }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" min-width="120" label="权限标识">
              <template slot-scope="scope">
                <span>{{ scope.row.perm }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" min-width="100" label="菜单类型">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.type === 0" type="primary">目录</el-tag>
                <el-tag v-if="scope.row.type === 1" type="success">菜单</el-tag>
                <el-tag v-if="scope.row.type === 2" type="warning">按钮</el-tag>
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" min-width="250">
              <template slot-scope="scope">
                <el-button
                  v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:menu:edit') !== -1"
                  size="mini"
                  type="primary"
                  @click="handleUpdate(scope.row)"
                >编辑
                </el-button>
                <el-button
                  v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:menu:api') !== -1"
                  size="mini"
                  type="primary"
                  @click="handleMenuApi(scope.row)"
                >关联API
                </el-button>
                <el-button
                  v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:menu:delete') !== -1"
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)"
                >删除
                </el-button>
              </template>
            </el-table-column>

          </el-table>

          <el-dialog
            width="70%"
            :title="textMap[dialogStatus]"
            :close-on-click-modal="false"
            :visible.sync="dialogFormVisible"
          >
            <el-form
              :inline="true"
              :model="menu"
              class="small-space menu-form"
              label-position="left"
              label-width="70px"
            >
              <el-form-item class="menu-form-item" label="类型">
                <el-radio-group v-model="menu.type">
                  <el-radio v-for="type in menuType" :key="type.id" :label="type.id">{{ type.name }}</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item class="menu-form-item" label="名称">
                <el-input
                  v-model="menu.menuName"
                  class="filter-item"
                  placeholder="名称必须唯一,英文"
                />
              </el-form-item>
              <el-form-item class="menu-form-item" label="显示名称">
                <el-input
                  v-model="menu.title"
                  class="filter-item"
                  placeholder="请输入显示名称"
                />
              </el-form-item>

              <el-form-item class="menu-form-item" label="上级菜单">
                <el-cascader v-model="cascadeParent" :props="menuProps" :options="menuTree" change-on-select @change="handleCascaderChange" />
              </el-form-item>

              <el-form-item v-if="menu.type !== 2" class="menu-form-item" label="路由path">
                <el-input
                  v-model="menu.path"
                  class="filter-item"
                  placeholder="请输入路由path"
                />
              </el-form-item>

              <el-form-item v-if="menu.type !== 2" class="menu-form-item" label="菜单图标">
                <el-input
                  v-model="menu.icon"
                  class="filter-item"
                  placeholder="请输入图标名称"
                />
              </el-form-item>

              <el-form-item class="menu-form-item" label="授权标识">
                <el-input
                  v-model="menu.perm"
                  class="filter-item"
                  placeholder="请输入授权标识,menu:add"
                />
              </el-form-item>
              <el-form-item v-if="menu.type !== 2" class="menu-form-item" label="组件路径">
                <el-input
                  v-model="menu.component"
                  class="filter-item"
                  placeholder="为一级菜单时填layout/Layout"
                />
              </el-form-item>
              <el-form-item v-if="menu.type !== 2" class="menu-form-item" label="重定向">
                <el-input
                  v-model="menu.redirect"
                  class="filter-item"
                  placeholder="不重定向不要填"
                />
              </el-form-item>
              <el-form-item v-if="menu.type !== 2" class="menu-form-item" label="是否隐藏">
                <el-radio-group v-model="menu.hidden">
                  <el-radio :label="1">隐藏</el-radio>
                  <el-radio :label="0">不隐藏</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="menu.type !== 2" class="menu-form-item" label="为子菜单">
                <el-radio-group v-model="menu.alwaysShow">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item v-if="menu.type !== 2" class="menu-form-item" label="排序号">
                <el-input-number v-model="menu.orderNum" />
              </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
              <el-button @click="dialogFormVisible = false">取 消</el-button>
              <el-button v-if="dialogStatus === 'create'" type="primary" @click="create">创建</el-button>
              <el-button v-else type="primary" @click="update">确 定</el-button>
            </div>
          </el-dialog>

          <el-dialog
            width="70%"
            :title="textMap['menuApi']"
            :close-on-click-modal="false"
            :visible.sync="menuApiVisible"
          >
            <el-form
              :inline="true"
              :model="menu"
              class="small-space"
              label-position="left"
              label-width="70px"
            >
              <tree-transfer
                :title="transferTitle"
                :from_data="fromData"
                :to_data="toData"
                :mode="mode"
                :default-props="{label:'name'}"
                :render-content="renderContent"
                filter
                leaf-only
                open-all
                node_key="apiId"
                pid="parentApiId"
                @addBtn="add"
                @removeBtn="remove"
              />
            </el-form>

            <div slot="footer" class="dialog-footer">
              <el-button @click="menuApiVisible = false">取 消</el-button>
              <el-button type="primary" @click="menuAuth">确 定</el-button>
            </div>
          </el-dialog>

        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
/* eslint-disable semi */

import { mapGetters } from 'vuex'
import waves from '@/directive/waves' // 水波纹指令
import { is200 } from '@/utils/http-status'
import { menuTree, menuAdd, menuUpdate, menuDelete, menuApi, menuAuth } from '@/api/system/menu'
import treeTransfer from 'el-tree-transfer'

export default {
  name: 'MenuManager',
  directives: {
    waves
  },
  components: { treeTransfer },
  data() {
    return {
      // 左边列表树结构的数据
      menuProps: {
        children: 'children',
        label: 'title',
        value: 'menuId'
      },
      // 上级菜单【级联】
      cascadeParent: [],
      transferTitle: ['未选API', '已选API'],
      methods: [{
        value: 'GET',
        label: 'GET'
      }, {
        value: 'POST',
        label: 'POST'
      }, {
        value: 'PUT',
        label: 'PUT'
      }, {
        value: 'DELETE',
        label: 'DELETE'
      }],
      total: null,
      treeItem: '',
      displayList: null,
      menuTree: null,
      menuTrees: null,
      listLoading: false,
      dialogFormVisible: false,
      menuApiVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑菜单',
        create: '创建菜单',
        menuApi: '关联API(只绑定API有效)'
      },
      menu: {
        menuId: undefined,
        parentMenuId: 0,
        cascadePath: '',
        type: 0,
        menuName: '',
        title: '',
        path: '',
        icon: '',
        perm: '',
        orderNum: '',
        hidden: 1,
        alwaysShow: 0,
        component: '',
        redirect: ''
      },
      menuType: [{
        id: 0,
        name: '目录'
      },
      {
        id: 1,
        name: '菜单'
      },
      {
        id: 2,
        name: '按钮'
      }],
      mode: 'transfer', // transfer addressList
      fromData: [],
      toData: [],
      menuApi: {
        menuId: '',
        apiIds: []
      }
    }
  },
  computed: {
    ...mapGetters([
      'permList'
    ])
  },
  watch: {
    treeItem: function(menuId) {
      if (menuId !== null) {
        this.displayList = null
        this.displayList = this.getMenuItem(menuId, this.menuTrees)
      }
    }
  },
  created() {
    this.getMenu()
  },
  methods: {
    getMenu() {
      menuTree().then(response => {
        const data = response.data
        if (!is200(data.code)) {
          this.$notify({
            title: '失败',
            message: '获取菜单失败',
            type: 'failure',
            duration: 2000
          })
        } else if (data.data.children !== undefined || data.data.children !== null) {
          this.displayList = data.data[0].children
          this.menuTree = data.data
          this.menuTrees = data.data[0]
        }
      })
    },
    // api 树形穿梭器
    getMenuApi(menuId) {
      menuApi(menuId).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.fromData = data.data.fromData
          this.toData = data.data.toData
        } else {
          this.$notify({
            title: '失败',
            message: '获取菜单关联API失败',
            type: 'failure',
            duration: 2000
          })
        }
      })
    },
    handleCascaderChange(value) {
      this.menu.parentMenuId = value[value.length - 1]
      // 数据库存放的是字符串格式，这里将前端的数组转换字符串
      this.menu.cascadePath = '[' + this.cascadeParent.join(',') + ']'
    },
    handleFilter() {
      this.dialogStatus = ''
    },
    handleCreate() {
      this.menu.menuId = undefined
      this.menu.parentMenuId = ''
      this.menu.cascadePath = ''
      this.menu.type = 0
      this.menu.menuName = ''
      this.menu.title = ''
      this.menu.path = ''
      this.menu.icon = ''
      this.menu.perm = ''
      this.menu.orderNum = ''
      this.menu.hidden = 1
      this.menu.alwaysShow = 0
      this.menu.component = ''
      this.menu.redirect = ''
      // 数组格式
      this.cascadeParent = []

      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleMenuApi(row) {
      this.menuApiVisible = true
      this.getMenuApi(row.menuId)
      this.menuApi.menuId = row.menuId
    },
    menuAuth() {
      // 先清空之前的
      this.menuApi.apiIds = []
      this.getLeafApi(this.toData)
      menuAuth(this.menuApi).then(response => {
        const data = response.data
        this.menuApiVisible = false
        if (is200(data.code)) {
          this.$notify({
            title: '成功',
            message: '菜单关联API成功',
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify({
            title: '失败',
            message: '菜单关联API失败',
            type: 'fail',
            duration: 2000
          })
        }
      })
    },
    handleUpdate(row) {
      this.menu.menuId = row.menuId
      this.menu.parentMenuId = row.parentMenuId
      this.menu.cascadePath = row.cascadePath
      this.menu.type = row.type
      this.menu.menuName = row.menuName
      this.menu.title = row.title
      this.menu.path = row.path
      this.menu.icon = row.icon
      this.menu.perm = row.perm
      this.menu.orderNum = row.orderNum
      this.menu.hidden = row.hidden
      this.menu.alwaysShow = row.alwaysShow
      this.menu.component = row.component
      this.menu.redirect = row.redirect
      // 前端需要的是数组格式，这里将后端传送的字符串转为数组
      this.cascadeParent = JSON.parse(this.menu.cascadePath)

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        menuDelete(row.menuId).then(response => {
          const data = response.data
          if (is200(data.code)) {
            this.$notify({
              title: '成功',
              message: '删除菜单成功',
              type: 'success',
              duration: 2000
            })
            this.getMenu()
          } else {
            this.$notify({
              title: '失败',
              message: '删除菜单失败',
              type: 'failure',
              duration: 2000
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleDownload() {
      this.dialogStatus = ''
    },
    create() {
      menuAdd(this.menu).then(response => {
        const data = response.data
        this.dialogFormVisible = false
        if (is200(data.code)) {
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
          this.getMenu()
        } else {
          this.$notify({
            title: '失败',
            message: '创建失败',
            type: 'fail',
            duration: 2000
          })
        }
      })
    },
    update() {
      menuUpdate(this.menu.menuId, this.menu).then(response => {
        const data = response.data
        this.dialogFormVisible = false
        if (is200(data.code)) {
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.getMenu()
        } else {
          this.$notify({
            title: '失败',
            message: '创建失败',
            type: 'fail',
            duration: 2000
          })
        }
      })
    },
    handleNodeClick(data) {
      this.treeItem = data.menuId
    },
    // 遍历树状结构，获取当前菜单下的子菜单信息
    getMenuItem(menuId, menuTrees) {
      if (menuTrees === undefined || menuTrees === null || menuTrees === '') {
        return []
      }
      if (menuId === menuTrees.menuId) {
        return menuTrees.children
      }
      if (menuTrees.children === undefined || menuTrees.children === null || menuTrees === '') {
        return []
      }
      let result = null
      let menu
      for (menu in menuTrees.children) {
        if (menuId === menuTrees.children[menu].menuId) {
          result = menuTrees.children[menu].children
          break
        } else {
          let retResult = null
          retResult = this.getMenuItem(menuId, menuTrees.children[menu])
          if (retResult !== null) {
            result = retResult
            break
          }
        }
      }

      if (result === '') {
        result = []
      }

      return result
    },
    getLeafApi(toData) {
      let api
      for (api in toData) {
        if (toData[api].type === 1) {
          this.menuApi.apiIds.push(toData[api].apiId)
        }
        if (toData[api].children !== undefined && toData[api].children !== null && toData[api].children.length > 0) {
          this.getLeafApi(toData[api].children)
        }
      }
    },
    // 切换模式 现有树形穿梭框模式transfer 和通讯录模式addressList
    changeMode() {
      if (this.mode === 'transfer') {
        this.mode = 'addressList';
      } else {
        this.mode = 'transfer';
      }
    },
    // 监听穿梭框组件添加
    add(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      // console.log('fromData:', fromData);
      // console.log('toData:', toData);
      this.toData = toData
    },
    // 监听穿梭框组件移除
    remove(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      // console.log('fromData:', fromData);
      // console.log('toData:', toData);
      this.toData = toData
    },
    renderContent(h, { node, data, store }) {
      let type = '目录'
      if (data.type === 1) {
        type = '接口'
      }
      return (
        <span style='flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;'>
          <span>
            <span>{node.label}</span>
          </span>
          <span>
            <el-button style='font-size: 12px;' type='text' >{ type }</el-button>
          </span>
        </span>)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .menu-container {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
  }

  .menu-container .left-bar {
    height: 100%;
    flex: 2;
  }

  .menu-container .left-bar .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: lightblue;
  }

  .menu-container .left-bar .el-tree {
    border: 0;
  }

  .menu-container .right-content {
    height: 100%;
    flex: 8;
    margin-left: 20px;
  }

  .menu-container .right-content .menu-form {
    width: 92%;
    margin-left: 8%;
  }

  .el-radio + .el-radio {
    margin-left: 20px;
  }

  .menu-container .right-content .menu-form .menu-form-item {
    width: 46%;
    margin-right: 20px;
  }

  /* 覆盖掉原先el-form-item__content样式，使得内容宽度占满父元素 */
  .menu-container .right-content .menu-form .menu-form-item .el-form-item__content {
    display: inline-block;
    vertical-align: top;
    width: 73%;
  }
</style>
