<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.filter.name"
        style="width: 200px;"
        class="filter-item"
        placeholder="名称"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.filter.loginName"
        style="width: 200px;"
        class="filter-item"
        placeholder="登录名"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.filter.phone"
        style="width: 200px;"
        class="filter-item"
        placeholder="电话"
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
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>

      <el-button
        v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:user:list') !== -1"
        v-waves
        class="filter-item"
        type="primary"
        icon="search"
        @click="handleFilter"
      >搜索
      </el-button>
      <el-button
        v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:user:add') !== -1"
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
      :key="tableKey"
      v-loading.body="listLoading"
      :data="userLists"
      border
      fit
      style="width: 100%"
    >

      <el-table-column align="center" label="序号" width="50" type="index" />

      <el-table-column label="名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="登录名">
        <template slot-scope="scope">
          <span>{{ scope.row.loginName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="电话">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column label="邮箱">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="250">
        <template slot-scope="scope">
          <el-button
            v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:user:edit') !== -1"
            size="mini"
            type="primary"
            @click="handleUpdate(scope.row)"
          >编辑
          </el-button>
          <el-button
            v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:user:ban') !== -1 && scope.row.isEnable === 1"
            size="mini"
            type="warning"
            @click="enableUser(scope.row)"
          >禁用
          </el-button>
          <el-button
            v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:user:ban') !== -1 && scope.row.isEnable === 0"
            size="mini"
            type="success"
            @click="enableUser(scope.row)"
          >解禁
          </el-button>
          <el-button
            v-if="typeof(permList) !== 'undefined' && permList.indexOf('sys:user:delete') !== -1"
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
        :page-sizes="[5,10,20,30, 50]"
        :page-size="listQuery.size"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" :visible.sync="dialogFormVisible">
      <el-form
        :rules="loginRules"
        :inline="true"
        :model="user"
        class="small-space user-form"
        label-position="left"
        label-width="70px"
      >

        <el-row>
          <el-col :span="12">
            <el-form-item class="user-form-item" label="名称">
              <el-input
                v-model="user.name"
                class="filter-item"
                style="display: flex; flex: 1"
                placeholder="请输入真实姓名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="loginName" class="user-form-item" label="登录名">
              <el-input
                v-model="user.loginName"
                name="loginName"
                class="filter-item"
                placeholder="请输入登录名"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item class="user-form-item" label="电话">
              <el-input
                v-model="user.phone"
                class="filter-item"
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="user-form-item" label="邮箱">
              <el-input
                v-model="user.email"
                class="filter-item"
                placeholder="请输入Email"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="passVisible">
          <el-col :span="12">
            <el-form-item prop="password" class="user-form-item" label="密码">
              <el-input
                v-model="user.password"
                name="password"
                class="filter-item"
                style="display: flex; flex: 1"
                placeholder="请输入密码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="confirm" class="user-form-item" label="确认密码">
              <el-input
                v-model="user.confirm"
                name="confirm"
                class="filter-item"
                placeholder="请再次输入密码"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item class="user-form-item" label="备注">
              <el-input
                v-model="user.remark"
                class="filter-item"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item class="user-form-item" label="头像">
              <el-button type="primary" icon="upload" @click="imageCropperShow=true">修改头像</el-button>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="3">
            角色分配
          </el-col>
          <el-col :span="24">
            <el-select
              v-model="user.roles"
              style="width: 100%; padding-right: 20px; margin-top: 10px;"
              multiple
              filterable
              allow-create
              placeholder="请选择角色"
            >
              <el-option
                v-for="item in roleOption"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
              />
            </el-select>
          </el-col>
        </el-row>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus==='create'" type="primary" @click="create">确 定</el-button>
        <el-button v-else type="primary" @click="update">确 定</el-button>
      </div>

      <ImageCropper
        v-show="imageCropperShow"
        :key="imageCropperKey"
        :width="300"
        :height="300"
        url="http://localhost/upload"
        @close="imageCropperClose"
        @crop-upload-success="imageCropperSuccess"
      />
    </el-dialog>

  </div>
</template>

<script>
/* eslint-disable semi */

import { parseTime } from '@/utils'
import { isMobile } from '@/utils/validate'
import { is200 } from '@/utils/http-status'
import ImageCropper from '@/components/ImageCropper'
import { mapGetters } from 'vuex'
import { userList, userAdd, userUpdate, userDel, userRole, userEnable } from '@/api/system/user'
import { roleAll } from '@/api/system/role'
import waves from '@/directive/waves' // 水波纹指令

export default {
  name: 'UserManager',
  directives: {
    waves
  },
  components: { ImageCropper },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    const validateMobile = (rule, value, callback) => {
      if (!isMobile(value)) {
        callback(new Error('请输入正确的合法手机号码'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value !== undefined && value.length < 6) {
        callback(new Error('密码不能小于6位'))
      } else {
        callback()
      }
    }
    const confirmPass = (rule, value, callback) => {
      if (value === '' || value !== undefined && value.length < 1) {
        callback(new Error('请输入确认密码'))
      } else if (value !== undefined && this.user.password !== value) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    }
    return {
      list: null,
      total: null,
      listLoading: true,
      userLists: null,
      listQuery: {
        page: 1,
        size: 10,
        sort: '',
        filter: {}
      },
      user: {
        userId: undefined,
        name: '',
        loginName: '',
        phone: '',
        password: '',
        email: '',
        remark: '',
        avatar: '',
        roles: []
      },
      roleOption: null,
      authRoles: [],
      sortOptions: [{ label: '按名称排序', key: 'name' }, { label: '按登录名排序', key: 'login_name' }],
      dialogFormVisible: false,
      passVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '创建用户'
      },
      loginRules: {
        loginName: [
          { required: true, trigger: 'blur', validator: validateMobile }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePass }
        ],
        confirm: [
          { required: false, trigger: 'blur', validator: confirmPass }
        ]
      },
      tableKey: 0,
      imageCropperShow: false,
      imageCropperKey: 'test'
    }
  },
  computed: {
    ...mapGetters([
      'permList'
    ])
  },
  created() {
    this.getList()
    // 获取角色
    roleAll().then(response => {
      const data = response.data
      if (is200(data.code)) {
        this.roleOption = data.data
      }
    })
  },
  methods: {
    imageCropperClose() {
      this.imageCropperShow = false
    },
    imageCropperSuccess() {
      this.imageCropperShow = false
    },
    getList() {
      this.listLoading = true
      userList(this.listQuery).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.$notify({
            title: '成功',
            message: '获取成功',
            type: 'success',
            duration: 500
          })
          this.userLists = data.data.records
          this.total = data.data.total
          this.listLoading = false
        } else {
          this.$notify({
            title: '失败',
            message: '获取失败',
            type: 'fail',
            duration: 2000
          })
          this.listLoading = false
        }
      })
    },
    handleFilter() {
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.size = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleCreate() {
      this.passVisible = true
      this.resetUser()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.passVisible = false
      this.user = Object.assign({}, row)
      // 用户角色
      userRole(row.userId).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.user.roles = data.data
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userDel(row.userId).then(response => {
          const data = response.data
          if (is200(data.code)) {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          } else {
            this.$notify({
              title: '失败',
              message: '删除失败',
              type: 'fail',
              duration: 2000
            })
          }
        }).catch(err => {
          this.$message.error(err)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    enableUser(row) {
      userEnable(row.userId).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.$notify({
            title: '成功',
            message: '更改成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        } else {
          this.$notify({
            title: '失败',
            message: '更改失败',
            type: 'fail',
            duration: 2000
          })
        }
      }).catch(err => {
        this.$message.error(err)
      })
    },
    create() {
      userAdd(this.user).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        } else {
          this.$notify({
            title: '失败',
            message: '创建失败',
            type: 'fail',
            duration: 2000
          })
        }
      }).catch(err => {
        this.$message.error(err)
      })
    },
    update() {
      // 密码不更新
      this.user.password = null
      this.user.isEnable = null
      userUpdate(this.user.userId, this.user).then(response => {
        const data = response.data
        if (is200(data.code)) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        } else {
          this.$notify({
            title: '失败',
            message: '更新失败',
            type: 'fail',
            duration: 2000
          })
        }
      }).catch(err => {
        this.$message.error(err)
      })
    },
    resetUser() {
      this.user = {
        userId: undefined,
        name: '',
        loginName: '',
        phone: '',
        email: '',
        remark: '',
        avatar: '',
        roles: []
      }
    },
    handleDownload() {
      require.ensure([], () => {
        const { export_json_to_excel } = require('@/vendor/Export2Excel')
        const tHeader = ['时间', '地区', '类型', '标题', '重要性']
        const filterVal = ['timestamp', 'province', 'type', 'title', 'importance']
        const data = this.formatJson(filterVal, this.list)
        export_json_to_excel(tHeader, data, 'table数据')
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .user-form {
    width: 92%;
    margin-left: 8%;
  }

  .user-form .user-form-item {
    width: 100%;
    margin-right: 20px;
  }

  /* 覆盖掉原先el-form-item__content样式，使得内容宽度占满父元素 */
  .user-form .user-form-item .el-form-item__content {
    display: inline-block;
    vertical-align: top;
    width: calc(100% - 100px);
  }
</style>
