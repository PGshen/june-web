<template>
  <div class="app-container client-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.filter.description"
        style="width: 200px;"
        class="filter-item"
        placeholder="描述"
        clearable
        @keyup.enter.native="handleFilter"
      />

      <el-select
        v-model="listQuery.sort"
        style="width: 120px"
        class="filter-item"
        placeholder="排序"
        @change="handleFilter"
      >
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
          <!---->
        </el-option>
      </el-select>

      <el-button
        v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:client:list') !== -1"
        v-waves
        class="filter-item"
        type="primary"
        icon="search"
        @click="handleFilter"
      >搜索
      </el-button>
      <el-button
        v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:client:add') !== -1"
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
      row-key="clientId"
      :data="displayList"
      border
      fit
      style="width: 100%"
    >
      <el-table-column align="center" label="序号" width="60" type="index">
        <!--xu-->
      </el-table-column>

      <el-table-column min-width="150" label="appId">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.appId }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180" label="appSecret">
        <template slot-scope="scope">
          <span>{{ scope.row.appSecret }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="150" label="描述">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column width="170px" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="320">
        <template slot-scope="scope">
          <el-button
            v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:client:edit') !== -1"
            size="mini"
            type="primary"
            @click="handleUpdate(scope.row)"
          >编辑
          </el-button>
          <el-button
            v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:client:api') !== -1"
            size="mini"
            type="info"
            @click="handleClientApi(scope.row)"
          >关联API
          </el-button>
          <el-button
            v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:client:ban') !== -1"
            size="mini"
            type="warning"
            @click="handleUpdate(scope.row)"
          >禁用
          </el-button>
          <el-button
            v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:client:delete') !== -1"
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination
        :current-page.sync="listQuery.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="listQuery.size"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      :title="textMap[dialogStatus]"
      :close-on-click-modal="false"
      :visible.sync="dialogFormVisible"
      width="70%"
    >
      <el-form
        :inline="true"
        :model="client"
        class="small-space client-form"
        label-position="left"
        label-width="30%"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="appId">
              <el-input
                v-model="client.appId"
                class="filter-item"
                placeholder="请输入appId(不可重复)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="appSecret">
              <el-input
                v-model="client.appSecret"
                class="filter-item"
                placeholder="请输入appSecret"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="访问范围">
              <el-input
                v-model="client.scope"
                class="filter-item"
                placeholder=""
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="授权类型">
              <el-input
                v-model="client.authorizedGrantTypes"
                class="filter-item"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="资源ID">
              <el-input
                v-model="client.resourceIds"
                class="filter-item"
                placeholder=""
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="重定向地址">
              <el-input
                v-model="client.webServerRedirectUri"
                class="filter-item"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="访问token有效期">
              <el-input
                v-model="client.accessTokenValidity"
                class="filter-item"
                placeholder=""
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="刷新token有效期">
              <el-input
                v-model="client.refreshTokenValidity"
                class="filter-item"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="权限">
              <el-input
                v-model="client.authorities"
                class="filter-item"
                placeholder=""
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="附加信息">
              <el-input
                v-model="client.additionalInformation"
                class="filter-item"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="描述">
              <el-input
                v-model="client.description"
                class="filter-item"
                placeholder="请输入描述"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="client-form-item" label="autoapprove">
              <el-select
                v-model="client.autoapprove"
                class="filter-item"
              >
                <el-option key="true" label="TRUE" value="true" />
                <el-option key="false" label="FALSE" value="false" />
              </el-select>
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
    <el-dialog
      width="80%"
      :title="textMap['clientApi']"
      :close-on-click-modal="false"
      :visible.sync="clientApiVisible"
    >
      <div class="client-api-container">
        <div class="left-bar">
          <el-card style="min-height: 100%">
            <div slot="header">
              <span style="line-height: 10px;">绑定IP</span>
              <el-button
                v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:client:ip:add') !== -1"
                class="filter-item"
                size="mini"
                style="margin-left: 10px; float: right"
                type="primary"
                icon="edit"
                @click="handleCreateIp"
              >
                添加
              </el-button>
            </div>
            <div class="body">
              <el-table
                row-key="ip"
                :data="ipList"
                stripe
                fit
                size="mini"
                :show-header="false"
                style="width: 100%"
                @row-click="getClientApi"
              >
                <el-table-column label="IP" prop="ip">
                  <template slot-scope="scope">
                    <span>{{ scope.row.ip }}</span>
                  </template>
                </el-table-column>
                <el-table-column>
                  <template slot-scope="scope">
                    <el-button
                      v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:client:ip:delete') !== -1"
                      style="float: right"
                      size="mini"
                      type="text"
                      @click="handleDeleteIp(scope.row)"
                    ><span style="color: red">删除</span>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
        <div class="right-content">
          <el-card style="min-height: 100%;">
            <el-form
              :inline="true"
              :model="client"
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
          </el-card>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clientApiVisible = false">取 消</el-button>
        <el-button type="primary" @click="clientAuth">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="新增绑定IP"
      :close-on-click-modal="false"
      :visible.sync="clientIpVisible"
    >
      <el-form
        :rules="rules"
        :inline="true"
        class="small-space"
        label-position="left"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item prop="newIp" class="client-form-item" label="IP">
              <el-input
                v-model="newIp"
                name="newIp"
                class="filter-item"
                placeholder="请输入IP"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clientIpVisible = false">取 消</el-button>
        <el-button type="primary" @click="createIp">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* eslint-disable semi */

import { mapGetters } from 'vuex'
import waves from '@/directive/waves' // 水波纹指令
import { is200 } from '@/utils/http-status'
import { isIp } from '@/utils/validate'
import { clientList, clientAdd, clientUpdate, clientDelete, clientApiGet, clientAuth, clientIpGet, clientIpDel, clientIpAdd } from '@/api/system/client'
import treeTransfer from 'el-tree-transfer'

export default {
  name: 'ClientManager',
  directives: {
    waves
  },
  components: { treeTransfer },
  data() {
    const validateIp = (rule, value, callback) => {
      if (value !== undefined && value.length < 1) {
        callback(new Error('IP不能为空'))
      } else if (!isIp(value)) {
        callback(new Error('请输入正确的合法IP'))
      } else if (this.ipList.indexOf(value) !== -1) {
        callback(new Error('当前IP已绑定，请确认输入正确'))
      } else {
        callback()
      }
    }
    return {
      // 查询条件
      listQuery: {
        page: 1,
        size: 10,
        sort: '',
        filter: {}
      },
      total: null,
      displayList: null,
      listLoading: false,
      ipLoading: false,
      sortOptions: [{ label: '按ID升序列', key: 'client_app_id' }, { label: '按ID降序', key: 'client_app_id desc' }],
      dialogFormVisible: false,
      clientApiVisible: false,
      clientIpVisible: false,
      newIp: '',
      dialogStatus: '',
      textMap: {
        update: '编辑客户端',
        create: '创建客户端',
        clientApi: '关联API(只关联接口)'
      },
      transferTitle: ['未选API', '已选API'],
      client: {
        clientId: undefined,
        appId: '',
        appSecret: '',
        description: '',
        scope: '',
        authorizedGrantTypes: '',
        resourceIds: '',
        webServerRedirectUri: '',
        accessTokenValidity: 0,
        refreshTokenValidity: 0,
        authorities: '',
        additionalInformation: '',
        autoapprove: ''
      },
      clientList: null,
      ipList: null,
      mode: 'transfer', // transfer addressList
      fromData: [],
      toData: [],
      clientApi: {
        clientId: '',
        ip: '',
        apiIds: []
      },
      rules: {
        newIp: [
          { require: true, trigger: 'blur', validator: validateIp }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'permList'
    ])
  },
  watch: {},
  created() {
    this.getClient()
  },
  methods: {
    getClient() {
      this.listLoading = true
      clientList(this.listQuery).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.displayList = data.data.records
          this.total = data.data.total
          this.$notify({
            title: '成功',
            message: '获取客户端列表成功',
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify({
            title: '失败',
            message: '获取客户端列表失败',
            type: 'failure',
            duration: 2000
          })
        }
        this.listLoading = false
      })
    },
    // api 树形穿梭器
    getClientApi(row) {
      this.clientApi.ip = row.ip
      clientApiGet(this.clientApi.clientId, this.clientApi).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.fromData = data.data.fromData
          this.toData = data.data.toData
        } else {
          this.$notify({
            title: '失败',
            message: '获取客户端关联API失败',
            type: 'failure',
            duration: 2000
          })
        }
      })
    },
    getClientIp(clientId) {
      clientIpGet(clientId).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.ipList = data.data
        } else {
          this.$notify({
            title: '失败',
            message: '获取客户端绑定的IP失败',
            type: 'failure',
            duration: 2000
          })
        }
      })
    },
    handleClientApi(row) {
      this.clientApiVisible = true
      this.fromData = []
      this.toData = []
      this.getClientIp(row.clientId)
      this.clientApi.clientId = row.clientId
    },
    handleDeleteIp(row) {
      this.$confirm('删除IP将会删除与IP关联的所有API, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.clientApi.ip = row.ip
        clientIpDel(this.clientApi.clientId, this.clientApi).then(response => {
          const data = response.data
          if (is200(data.code)) {
            this.$notify({
              title: '成功',
              message: '删除客户端关联IP成功',
              type: 'success',
              duration: 2000
            })
            this.getClientIp(this.clientApi.clientId)
            this.fromData = []
            this.toData = []
          } else {
            this.$notify({
              title: '失败',
              message: '获取客户端关联API失败',
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
    clientAuth() {
      // 先清空之前的
      this.clientApi.apiIds = []
      this.getLeafApi(this.toData)
      clientAuth(this.clientApi).then(response => {
        const data = response.data
        this.clientApiVisible = false
        if (is200(data.code)) {
          this.$notify({
            title: '成功',
            message: '客户端关联API成功',
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify({
            title: '失败',
            message: '客户端关联API失败',
            type: 'fail',
            duration: 2000
          })
        }
      })
    },
    handleCreate() {
      this.client.clientId = undefined
      this.client.appId = ''
      this.client.appSecret = ''
      this.client.description = ''
      this.scope = ''
      this.authorizedGrantTypes = ''
      this.resourceIds = ''
      this.webServerRedirectUri = ''
      this.accessTokenValidity = 0
      this.refreshTokenValidity = 0
      this.authorities = ''
      this.additionalInformation = ''
      this.autoapprove = ''
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.client.clientId = row.clientId
      this.client.appId = row.appId
      this.client.appSecret = row.appSecret
      this.client.description = row.description
      this.authorizedGrantTypes = row.authorizedGrantTypes
      this.resourceIds = row.resourceIds
      this.webServerRedirectUri = row.webServerRedirectUri
      this.accessTokenValidity = row.accessTokenValidity
      this.refreshTokenValidity = row.refreshTokenValidity
      this.authorities = row.authorities
      this.additionalInformation = row.additionalInformation
      this.autoapprove = row.autoapprove

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleForbid(row) {
      // todo 禁用？？
      clientDelete(row.clientId).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.dialogFormVisible = false
          this.getClient()
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        clientDelete(row.clientId).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const data = response.data
          if (is200(data.code)) {
            this.getClient()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleCreateIp() {
      this.clientIpVisible = true
      this.newIp = ''
    },
    handleDownload() {
      this.dialogStatus = ''
    },
    handleFilter() {
      this.getClient()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getClient()
    },
    handleSizeChange(val) {
      this.listQuery.size = val
    },
    handlePageChange(val) {
      this.listQuery.page = val
    },
    createIp() {
      this.clientApi.apiIds = []
      this.clientApi.ip = this.newIp
      // 还是调用客户端授权接口，只是新的IP关联的API为空
      clientIpAdd(this.clientApi).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.clientIpVisible = false
          this.$notify({
            title: '成功',
            message: '客户端绑定新IP成功',
            type: 'success',
            duration: 2000
          })
          this.getClientIp(this.clientApi.clientId)
        } else {
          this.$notify({
            title: '失败',
            message: '客户端绑定新IP失败,' + data.message,
            type: 'fail',
            duration: 2000
          })
        }
      })
    },
    create() {
      clientAdd(this.client).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
          this.getClient()
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
      clientUpdate(this.client.clientId, this.client).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.getClient()
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
    getLeafApi(toData) {
      let api
      for (api in toData) {
        if (toData[api].type === 1) {
          this.clientApi.apiIds.push(toData[api].apiId)
        }
        if (toData[api].children !== undefined && toData[api].children !== null && toData[api].children.length > 0) {
          this.getLeafApi(toData[api].children)
        }
      }
    },
    // 切换模式 现有树形穿梭框模式transfer 和通讯录模式addressList
    changeMode() {
      if (this.mode === 'transfer') {
        this.mode = 'addressList'
      } else {
        this.mode = 'transfer'
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
        <span style = 'flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;'>
          <span>
            <span>{node.label}</span>
          </span>
          <span>
            <el-button style = 'font-size: 12px;' type = 'text' >{ type }</el-button>
          </span>
        </span>)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .client-api-container {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
  }

  .client-api-container .left-bar {
    height: 100%;
    flex: 2;
  }

  .client-api-container .right-content {
    height: 100%;
    flex: 8;
    margin-left: 20px;
  }

  .client-form {
    width: 92%;
    margin-left: 5%;
  }

  .client-form .client-form-item {
    width: 100%;
    margin-right: 10px;
  }

  /*.role-tree .el-tree {*/
  /*border: 0;*/
  /*}*/

  .client-container .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: lightblue;
  }
</style>
