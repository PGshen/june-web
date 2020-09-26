<template>
  <div class="app-container api-container">
    <div class="left-bar">
      <el-card style="min-height: 100%">
        <div slot="header">
          <span style="line-height: 10px;">API目录</span>
        </div>
        <el-tree
          :data="apiTree"
          :props="apiProps"
          :highlight-current="true"
          accordion
          @node-click="handleNodeClick"
        />
      </el-card>
    </div>

    <div class="right-content">
      <el-card style="min-height: 100%">
        <div slot="header">
          <span style="line-height: 10px;">API列表</span>
        </div>
        <div class="body">
          <div class="filter-container">
            <el-button
              v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:api:add') !== -1"
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
            row-key="apiId"
            :data="displayList"
            border
            fit
            style="width: 100%"
          >
            <el-table-column align="center" label="序号" width="60" type="index" />

            <el-table-column min-width="150" label="API名称">
              <template slot-scope="scope">
                <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.name }}</span>
              </template>
            </el-table-column>

            <el-table-column min-width="150" label="描述">
              <template slot-scope="scope">
                <span>{{ scope.row.description }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" min-width="80" label="类型">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.type === 0" type="primary">目录</el-tag>
                <el-tag v-if="scope.row.type === 1" type="success">API</el-tag>
              </template>
            </el-table-column>

            <el-table-column min-width="180" label="请求URL">
              <template slot-scope="scope">
                <span>{{ scope.row.uri }}</span>
              </template>
            </el-table-column>

            <el-table-column min-width="130" label="请求Method">
              <template slot-scope="scope">
                <span>{{ scope.row.method }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" width="160">
              <template slot-scope="scope">
                <el-button
                  v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:api:edit') !== -1"
                  size="mini"
                  type="primary"
                  @click="handleUpdate(scope.row)"
                >编辑
                </el-button>
                <el-button
                  v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:api:delete') !== -1"
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)"
                >删除
                </el-button>
              </template>
            </el-table-column>

          </el-table>

          <el-dialog
            :title="textMap[dialogStatus]"
            :close-on-click-modal="false"
            :visible.sync="dialogFormVisible"
          >
            <el-form
              :inline="true"
              :model="api"
              class="small-space api-form"
              label-position="left"
              label-width="70px"
            >
              <el-row>
                <el-col :span="12">
                  <el-form-item class="menu-form-item" label="类型">
                    <el-radio-group v-model="api.type">
                      <el-radio v-for="type in apiType" :key="type.id" :label="type.id">{{ type.name }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item class="api-form-item" label="名称">
                    <el-input
                      v-model="api.name"
                      class="filter-item"
                      placeholder="请输入名称"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item class="api-form-item" label="描述">
                    <el-input
                      v-model="api.description"
                      class="filter-item"
                      placeholder="请输入描述"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item class="api-form-item" label="上级目录">
                    <el-cascader v-model="cascadeParent" :props="apiProps" :options="apiTree" change-on-select @change="handleCascaderChange" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="api.type === 1">
                <el-col :span="12">
                  <el-form-item class="api-form-item" label="请求方法">
                    <el-select v-model="api.method" placeholder="请选择">
                      <el-option
                        v-for="item in methods"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item class="api-form-item" label="请求URI">
                    <el-input
                      v-model="api.uri"
                      class="filter-item"
                      placeholder="请输入请求URI"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <div slot="footer" class="dialog-footer">
              <el-button @click="dialogFormVisible = false">取 消</el-button>
              <el-button v-if="dialogStatus === 'create'" type="primary" @click="create">创建</el-button>
              <el-button v-else type="primary" @click="update">确 定</el-button>
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
import { apiTree, apiAdd, apiUpdate, apiDelete } from '@/api/system/api'

export default {
  name: 'ApiManager',
  directives: {
    waves
  },
  data() {
    return {
      // 左边列表树结构的数据
      apiProps: {
        children: 'children',
        label: 'name',
        value: 'apiId'
      },
      // 上级菜单【级联】
      cascadeParent: [],
      // 右边菜单列表数据
      listQuery: {
        page: 1,
        size: 20,
        sort: 'api_id',
        filter: {}
      },
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
      apiType: [{
        id: 0,
        name: '目录'
      },
      {
        id: 1,
        name: 'API'
      }],
      total: null,
      treeItem: '',
      displayList: null,
      listLoading: false,
      sortOptions: [{ label: '按ID升序列', key: 'api_id' }, { label: '按ID降序', key: 'api_id desc' }],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑API',
        create: '创建API'
      },
      api: {
        apiId: undefined,
        parentApiId: 0,
        cascadePath: '',
        type: 0,
        name: '',
        description: '',
        uri: '',
        method: ''
      },
      apiTree: null,
      apiTrees: null
    }
  },
  computed: {
    ...mapGetters([
      'permList'
    ])
  },
  watch: {
    treeItem: function(apiId) {
      if (apiId !== null) {
        this.displayList = null
        this.displayList = this.getApiItem(apiId, this.apiTrees)
      }
    }
  },
  created() {
    this.getApi()
  },
  methods: {
    getApi() {
      apiTree().then(response => {
        const data = response.data
        if (!is200(data.code)) {
          this.$notify({
            title: '失败',
            message: '获取API列表失败',
            type: 'failure',
            duration: 2000
          })
        } else if (data.data.children !== undefined || data.data.children !== null) {
          this.$notify({
            title: '成功',
            message: '获取API列表成功',
            type: 'success',
            duration: 2000
          })
          this.apiTrees = data.data[0]
          this.apiTree = data.data
          this.displayList = data.data[0].children
        } else {
          this.$notify({
            title: '成功',
            message: 'API列表失败为空',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    handleCascaderChange(value) {
      this.api.parentApiId = value[value.length - 1]
      this.api.cascadePath = '[' + this.cascadeParent.join(',') + ']'
    },
    handleCreate() {
      this.api.apiId = undefined
      this.api.parentApiId = ''
      this.api.cascadePath = ''
      this.api.type = 0
      this.api.name = ''
      this.api.description = ''
      this.api.uri = ''
      this.api.method = ''
      this.cascadeParent = []

      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.api.apiId = row.apiId
      this.api.parentApiId = row.parentApiId
      this.api.cascadePath = row.cascadePath
      this.api.type = row.type
      this.api.name = row.name
      this.api.description = row.description
      this.api.uri = row.uri
      this.api.method = row.method
      // 前端需要的是数组格式，这里将后端传送的字符串转为数组
      this.cascadeParent = JSON.parse(this.api.cascadePath)

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleForbid(row) {
      // todo 禁用？？
      apiDelete(row.apiId).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.dialogFormVisible = false
          this.getApi()
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        apiDelete(row.apiId).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const data = response.data
          if (is200(data.code)) {
            this.getApi()
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
    handleSizeChange(val) {
      this.listQuery.size = val
    },
    handlePageChange(val) {
      this.listQuery.page = val
    },
    create() {
      apiAdd(this.api).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
          this.getApi()
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
      apiUpdate(this.api.apiId, this.api).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.getApi()
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
      this.treeItem = data.apiId
    },
    // 遍历树状结构，获取当前菜单下的子菜单信息
    getApiItem(apiId, apiTrees) {
      if (apiTrees === undefined || apiTrees === null || apiTrees === '') {
        return []
      }
      if (apiId === apiTrees.apiId) {
        return apiTrees.children
      }
      if (apiTrees.children === undefined || apiTrees.children === null || apiTrees === '') {
        return []
      }
      let result = null
      let api
      for (api in apiTrees.children) {
        if (apiId === apiTrees.children[api].apiId) {
          result = apiTrees.children[api].children
          break
        } else {
          let retResult = null
          retResult = this.getApiItem(apiId, apiTrees.children[api])
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
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .api-container {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
  }

  .api-container .left-bar {
    height: 100%;
    flex: 2;
  }

  .api-container .left-bar .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: lightblue;
  }

  .api-container .left-bar .el-tree {
    border: 0;
  }

  .api-container .right-content {
    height: 100%;
    flex: 8;
    margin-left: 20px;
  }

  .api-container .right-content .api-form {
    width: 92%;
    margin-left: 8%;
  }

  .el-radio + .el-radio {
    margin-left: 20px;
  }

  .api-container .right-content .api-form .api-form-item {
    width: 100%;
    margin-right: 20px;
  }

  /* 覆盖掉原先el-form-item__content样式，使得内容宽度占满父元素 */
  .api-container .right-content .api-form .api-form-item .el-form-item__content {
    display: inline-block;
    vertical-align: top;
    width: 73%;
  }
</style>
