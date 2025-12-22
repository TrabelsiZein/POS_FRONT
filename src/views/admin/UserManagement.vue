<template>
  <div class="user-management-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('admin.userManagement.title') }}</h2>
      <b-button variant="primary" @click="openAddUserModal">
        <feather-icon icon="PlusIcon" size="16" />
        {{ $t('admin.userManagement.addUser') }}
      </b-button>
    </div>

    <!-- Users Table -->
    <b-card>
      <b-table :items="users" :fields="userFields" striped hover responsive :busy="loading">
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>{{ $t('admin.userManagement.loading') }}</strong>
          </div>
        </template>

        <template #cell(role)="row">
          <b-badge :variant="getRoleBadgeVariant(row.item.role)">
            {{ getRoleLabel(row.item.role) }}
          </b-badge>
        </template>

        <template #cell(active)="row">
          <b-badge :variant="row.item.active ? 'success' : 'danger'">
            {{ row.item.active ? $t('admin.userManagement.status.active') : $t('admin.userManagement.status.inactive') }}
          </b-badge>
        </template>

        <template #cell(badgeCode)="row">
          <span v-if="row.item.badgeCode" class="badge-code-display">
            <feather-icon icon="CreditCardIcon" size="14" class="mr-1" />
            {{ row.item.badgeCode }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(badgeStatus)="row">
          <div v-if="row.item.badgeCode">
            <b-badge v-if="isBadgeExpired(row.item)" variant="warning">
              {{ $t('admin.userManagement.badge.status.expired') }}
            </b-badge>
            <b-badge v-else-if="row.item.badgeRevoked" variant="danger">
              {{ $t('admin.userManagement.badge.status.revoked') }}
            </b-badge>
            <b-badge v-else variant="success">
              {{ $t('admin.userManagement.badge.status.active') }}
            </b-badge>
          </div>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(actions)="row">
          <b-button-group size="sm">
            <b-button variant="outline-primary" @click="editUser(row.item)" :disabled="row.item.role === 'ADMIN'">
              <feather-icon icon="EditIcon" size="14" />
            </b-button>
            <b-button v-if="row.item.badgeCode && !row.item.badgeRevoked" variant="outline-warning" 
              @click="confirmRevokeBadge(row.item)" :disabled="row.item.role === 'ADMIN'">
              <feather-icon icon="XCircleIcon" size="14" />
            </b-button>
            <b-button v-else-if="row.item.badgeCode && row.item.badgeRevoked" variant="outline-success" 
              @click="reactivateBadge(row.item)" :disabled="row.item.role === 'ADMIN'">
              <feather-icon icon="CheckCircleIcon" size="14" />
            </b-button>
            <b-button variant="outline-danger" @click="confirmDeleteUser(row.item)"
              :disabled="row.item.role === 'ADMIN'">
              <feather-icon icon="TrashIcon" size="14" />
            </b-button>
          </b-button-group>
        </template>
      </b-table>
    </b-card>

    <!-- Add/Edit User Modal -->
    <b-modal v-model="showAddUserModal" :title="editingUser ? $t('admin.userManagement.editUser') : $t('admin.userManagement.addNewUser')" 
      size="xl" @ok="saveUser" @cancel="resetUserForm" body-class="p-0">
      <div class="user-form-container">
        <!-- User Information Card -->
        <b-card class="mb-3 border-0 shadow-sm" no-body>
          <b-card-header class="bg-primary text-white">
            <h5 class="mb-0">
              <feather-icon icon="UserIcon" size="18" class="mr-2" />
              {{ $t('admin.userManagement.userInfo') }}
            </h5>
          </b-card-header>
          <b-card-body>
            <b-row>
              <b-col cols="12" md="6">
                <b-form-group :label="$t('admin.userManagement.form.username')" label-for="username">
                  <b-form-input id="username" v-model="userForm.username" :disabled="editingUser" required />
                </b-form-group>
              </b-col>
              <b-col cols="12" md="6">
                <b-form-group :label="$t('admin.userManagement.form.fullName')" label-for="fullName">
                  <b-form-input id="fullName" v-model="userForm.fullName" />
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="12" md="6">
                <b-form-group :label="$t('admin.userManagement.form.email')" label-for="email">
                  <b-form-input id="email" v-model="userForm.email" type="email" />
                </b-form-group>
              </b-col>
              <b-col cols="12" md="6">
                <b-form-group :label="$t('admin.userManagement.form.password')" label-for="password">
                  <b-form-input id="password" v-model="userForm.password" type="password" :required="!editingUser" />
                  <small class="form-text text-muted" v-if="editingUser">
                    {{ $t('admin.userManagement.form.passwordHelp') }}
                  </small>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="12" md="6">
                <b-form-group :label="$t('admin.userManagement.form.role')" label-for="role">
                  <b-form-select id="role" v-model="userForm.role" :options="roleOptions" required />
                </b-form-group>
              </b-col>
              <b-col cols="12" md="6" v-if="editingUser">
                <b-form-group :label="$t('admin.userManagement.form.status')" label-for="status">
                  <b-form-checkbox id="status" v-model="userForm.active" switch>
                    {{ $t('admin.userManagement.status.active') }}
                  </b-form-checkbox>
                </b-form-group>
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>

        <!-- Badge Management Card -->
        <b-card class="mb-0 border-0 shadow-sm" no-body>
          <b-card-header class="bg-info text-white">
            <h5 class="mb-0">
              <feather-icon icon="CreditCardIcon" size="18" class="mr-2" />
              {{ $t('admin.userManagement.badge.title') }}
            </h5>
          </b-card-header>
          <b-card-body>
            <b-row>
              <b-col cols="12" md="6">
                <b-form-group :label="$t('admin.userManagement.badge.badgeCode')" label-for="badgeCode">
                  <b-input-group>
                    <b-form-input id="badgeCode" v-model="userForm.badgeCode" 
                      :placeholder="$t('admin.userManagement.badge.badgeCodePlaceholder')" />
                    <b-input-group-append>
                      <b-button variant="outline-secondary" @click="generateBadgeCode" :disabled="!editingUser && !userForm.username">
                        <feather-icon icon="RefreshCwIcon" size="14" class="mr-1" />
                        {{ $t('admin.userManagement.badge.generate') }}
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                  <small class="form-text text-muted">{{ $t('admin.userManagement.badge.badgeCodeHelp') }}</small>
                </b-form-group>
              </b-col>
              <b-col cols="12" md="6">
                <b-form-group :label="$t('admin.userManagement.badge.badgeExpirationDate')" label-for="badgeExpirationDate">
                  <b-form-input id="badgeExpirationDate" v-model="userForm.badgeExpirationDate" type="datetime-local" />
                  <small class="form-text text-muted">{{ $t('admin.userManagement.badge.badgeExpirationDateHelp') }}</small>
                </b-form-group>
              </b-col>
            </b-row>

            <b-form-group :label="$t('admin.userManagement.badge.badgePermissions')" label-for="badgePermissions">
              <b-row>
                <b-col cols="12" md="6" v-for="permission in badgePermissionOptions" :key="permission.value">
                  <b-form-checkbox :value="permission.value" v-model="userForm.badgePermissions">
                    {{ permission.text }}
                  </b-form-checkbox>
                </b-col>
              </b-row>
              <small class="form-text text-muted">{{ $t('admin.userManagement.badge.badgePermissionsHelp') }}</small>
            </b-form-group>

            <div v-if="editingUser && userForm.badgeCode" class="badge-status-info mt-3">
              <b-alert :variant="getBadgeStatusVariant(userForm)" show>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ $t('admin.userManagement.badge.currentStatus') }}:</strong>
                    <span v-if="isBadgeExpired(userForm)" class="ml-2">
                      <b-badge variant="warning">{{ $t('admin.userManagement.badge.status.expired') }}</b-badge>
                    </span>
                    <span v-else-if="userForm.badgeRevoked" class="ml-2">
                      <b-badge variant="danger">{{ $t('admin.userManagement.badge.status.revoked') }}</b-badge>
                    </span>
                    <span v-else class="ml-2">
                      <b-badge variant="success">{{ $t('admin.userManagement.badge.status.active') }}</b-badge>
                    </span>
                  </div>
                </div>
              </b-alert>
            </div>
          </b-card-body>
        </b-card>
      </div>
    </b-modal>

    <!-- Revoke Badge Confirmation Modal -->
    <b-modal v-model="showRevokeBadgeModal" :title="$t('admin.userManagement.badge.revokeBadge')" @ok="revokeBadge">
      <b-form-group :label="$t('admin.userManagement.badge.revokeReason')" label-for="revokeReason">
        <b-form-textarea id="revokeReason" v-model="revokeReason" rows="3" 
          :placeholder="$t('admin.userManagement.badge.revokeReasonPlaceholder')" />
      </b-form-group>
    </b-modal>

    <!-- Delete Confirmation Modal -->
    <b-modal v-model="showDeleteModal" :title="$t('admin.userManagement.deleteUser')" @ok="deleteUser">
      <p>{{ $t('admin.userManagement.deleteConfirmation') }} <strong>{{ userToDelete && userToDelete.username ? userToDelete.username :
          ''
          }}</strong>?</p>
      <p class="text-danger">{{ $t('admin.userManagement.deleteWarning') }}</p>
    </b-modal>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      loading: false,
      showAddUserModal: false,
      showDeleteModal: false,
      showRevokeBadgeModal: false,
      editingUser: null,
      userToDelete: null,
      userToRevokeBadge: null,
      revokeReason: '',
      badgePermissions: [
        'CONSULT_CUSTOMER_LIST',
        'MAKE_RETURN',
        'APPLY_LINE_DISCOUNT',
        'APPLY_TOTAL_DISCOUNT'
      ],
      userForm: {
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'POS_USER',
        active: true,
        badgeCode: '',
        badgeExpirationDate: '',
        badgePermissions: []
      }
    }
  },
  computed: {
    userFields() {
      return [
        { key: 'username', label: this.$t('admin.userManagement.tableHeaders.username'), sortable: true },
        { key: 'fullName', label: this.$t('admin.userManagement.tableHeaders.fullName'), sortable: true },
        { key: 'email', label: this.$t('admin.userManagement.tableHeaders.email'), sortable: true },
        { key: 'role', label: this.$t('admin.userManagement.tableHeaders.role'), sortable: true },
        { key: 'badgeCode', label: this.$t('admin.userManagement.tableHeaders.badgeCode'), sortable: true },
        { key: 'badgeStatus', label: this.$t('admin.userManagement.tableHeaders.badgeStatus'), sortable: false },
        { key: 'active', label: this.$t('admin.userManagement.tableHeaders.status'), sortable: true },
        { key: 'actions', label: this.$t('admin.userManagement.tableHeaders.actions'), sortable: false }
      ]
    },
    roleOptions() {
      return [
        { value: 'ADMIN', text: this.$t('admin.userManagement.roles.administrator') },
        { value: 'RESPONSIBLE', text: this.$t('admin.userManagement.roles.responsible') },
        { value: 'POS_USER', text: this.$t('admin.userManagement.roles.posUser') }
      ]
    },
    badgePermissionOptions() {
      return [
        { value: 'CONSULT_CUSTOMER_LIST', text: this.$t('admin.userManagement.badge.permissions.consult_customer_list') },
        { value: 'MAKE_RETURN', text: this.$t('admin.userManagement.badge.permissions.make_return') },
        { value: 'APPLY_LINE_DISCOUNT', text: this.$t('admin.userManagement.badge.permissions.apply_line_discount') },
        { value: 'APPLY_TOTAL_DISCOUNT', text: this.$t('admin.userManagement.badge.permissions.apply_total_discount') }
      ]
    }
  },
  watch: {
    'userForm.role'(newRole) {
      // Auto-initialize badge permissions based on role
      if (newRole === 'RESPONSIBLE' && (!this.userForm.badgePermissions || this.userForm.badgePermissions.length === 0)) {
        this.userForm.badgePermissions = [...this.badgePermissions]
      } else if (newRole === 'POS_USER') {
        this.userForm.badgePermissions = []
      }
    }
  },
  mounted() {
    this.loadUsers()
  },
  methods: {
    openAddUserModal() {
      this.resetUserForm()
      this.showAddUserModal = true
    },
    async loadUsers() {
      this.loading = true
      try {
        const response = await this.$http.get('/user-account')
        this.users = response.data
      } catch (error) {
        console.error('Error loading users:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.userManagement.messages.failedToLoad'),
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    async editUser(user) {
      this.editingUser = user
      
      // Load full user details including badge info
      try {
        const response = await this.$http.get(`/user-account/${user.id}`)
        const fullUser = response.data
        
        // Parse badge permissions
        let permissions = []
        if (fullUser.badgePermissions) {
          permissions = fullUser.badgePermissions.split(',').map(p => p.trim()).filter(p => p)
        }
        
        this.userForm = {
          username: fullUser.username,
          fullName: fullUser.fullName || '',
          email: fullUser.email || '',
          password: '',
          role: fullUser.role,
          active: fullUser.active,
          badgeCode: fullUser.badgeCode || '',
          badgeExpirationDate: fullUser.badgeExpirationDate ? this.formatDateTimeLocal(fullUser.badgeExpirationDate) : '',
          badgePermissions: permissions,
          badgeRevoked: fullUser.badgeRevoked || false
        }
      } catch (error) {
        console.error('Error loading user details:', error)
        // Fallback to basic user data
        this.userForm = {
          username: user.username,
          fullName: user.fullName || '',
          email: user.email || '',
          password: '',
          role: user.role,
          active: user.active,
          badgeCode: user.badgeCode || '',
          badgeExpirationDate: '',
          badgePermissions: [],
          badgeRevoked: user.badgeRevoked || false
        }
      }
      
      this.showAddUserModal = true
    },
    async saveUser() {
      try {
        if (this.editingUser) {
          // Update user
          const updateData = {
            fullName: this.userForm.fullName,
            email: this.userForm.email,
            role: this.userForm.role,
            active: this.userForm.active,
            badgeCode: this.userForm.badgeCode || null,
            badgeExpirationDate: this.userForm.badgeExpirationDate || null,
            badgePermissions: this.userForm.badgePermissions || []
          }
          if (this.userForm.password) {
            updateData.password = this.userForm.password
          }

          await this.$http.put(`/user-account/${this.editingUser.id}`, updateData)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('admin.userManagement.messages.userUpdated'),
              variant: 'success'
            }
          })
        } else {
          // Create user
          await this.$http.post('/user-account', this.userForm)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('admin.userManagement.messages.userCreated'),
              variant: 'success'
            }
          })
        }
        
        this.resetUserForm()
        this.loadUsers()
      } catch (error) {
        console.error('Error saving user:', error)
        let errorMessage = this.$t('admin.userManagement.messages.failedToSave')
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger'
          }
        })
      }
    },
    confirmDeleteUser(user) {
      this.userToDelete = user
      this.showDeleteModal = true
    },
    async deleteUser() {
      try {
        await this.$http.delete(`/user-account/${this.userToDelete.id}`)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.success'),
            icon: 'CheckCircleIcon',
            text: this.$t('admin.userManagement.messages.userDeleted'),
            variant: 'success'
          }
        })
        this.showDeleteModal = false
        this.userToDelete = null
        this.loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        let errorMessage = this.$t('admin.userManagement.messages.failedToDelete')
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger'
          }
        })
      }
    },
    resetUserForm() {
      this.editingUser = null
      this.userForm = {
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'POS_USER',
        active: true,
        badgeCode: '',
        badgeExpirationDate: '',
        badgePermissions: []
      }
      this.showAddUserModal = false
    },
    async generateBadgeCode() {
      if (!this.editingUser && !this.userForm.username) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.userManagement.badge.messages.usernameRequired'),
            variant: 'warning'
          }
        })
        return
      }

      try {
        const userId = this.editingUser ? this.editingUser.id : null
        if (userId) {
          const response = await this.$http.post(`/user-account/${userId}/badge/generate`)
          this.userForm.badgeCode = response.data.badgeCode
          
          // Initialize permissions based on role if not set
          if (this.userForm.role === 'RESPONSIBLE' && (!this.userForm.badgePermissions || this.userForm.badgePermissions.length === 0)) {
            this.userForm.badgePermissions = [...this.badgePermissions]
          }
        } else {
          // For new users, generate a temporary code (will be generated on save)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.info'),
              icon: 'InfoIcon',
              text: this.$t('admin.userManagement.badge.messages.generateOnSave'),
              variant: 'info'
            }
          })
        }
      } catch (error) {
        console.error('Error generating badge code:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: this.$t('admin.userManagement.badge.messages.failedToGenerate'),
            variant: 'danger'
          }
        })
      }
    },
    confirmRevokeBadge(user) {
      this.userToRevokeBadge = user
      this.revokeReason = ''
      this.showRevokeBadgeModal = true
    },
    async revokeBadge() {
      if (!this.userToRevokeBadge) return

      try {
        await this.$http.post(`/user-account/${this.userToRevokeBadge.id}/badge/revoke`, {
          reason: this.revokeReason
        })
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.success'),
            icon: 'CheckCircleIcon',
            text: this.$t('admin.userManagement.badge.messages.badgeRevoked'),
            variant: 'success'
          }
        })
        this.showRevokeBadgeModal = false
        this.userToRevokeBadge = null
        this.revokeReason = ''
        this.loadUsers()
      } catch (error) {
        console.error('Error revoking badge:', error)
        let errorMessage = this.$t('admin.userManagement.badge.messages.failedToRevoke')
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger'
          }
        })
      }
    },
    async reactivateBadge(user) {
      try {
        await this.$http.post(`/user-account/${user.id}/badge/reactivate`)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.success'),
            icon: 'CheckCircleIcon',
            text: this.$t('admin.userManagement.badge.messages.badgeReactivated'),
            variant: 'success'
          }
        })
        this.loadUsers()
      } catch (error) {
        console.error('Error reactivating badge:', error)
        let errorMessage = this.$t('admin.userManagement.badge.messages.failedToReactivate')
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger'
          }
        })
      }
    },
    isBadgeExpired(user) {
      if (!user.badgeExpirationDate) return false
      const expirationDate = new Date(user.badgeExpirationDate)
      return expirationDate < new Date()
    },
    getBadgeStatusVariant(user) {
      if (this.isBadgeExpired(user)) return 'warning'
      if (user.badgeRevoked) return 'danger'
      return 'success'
    },
    formatDateTimeLocal(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    },
    getRoleLabel(role) {
      const roleMap = {
        'ADMIN': this.$t('admin.userManagement.roles.administrator'),
        'RESPONSIBLE': this.$t('admin.userManagement.roles.responsible'),
        'POS_USER': this.$t('admin.userManagement.roles.posUser')
      }
      return roleMap[role] || role
    },
    getRoleBadgeVariant(role) {
      switch (role) {
        case 'ADMIN':
          return 'danger'
        case 'RESPONSIBLE':
          return 'warning'
        case 'POS_USER':
          return 'info'
        default:
          return 'secondary'
      }
    }
  }
}
</script>

<style scoped>
.user-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

@media (max-width: 575.98px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .page-header .btn {
    width: 100%;
  }
}

.user-form-container {
  padding: 1.5rem;
}

.user-form-container .card {
  border-radius: 0.5rem;
}

.user-form-container .card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
  padding: 1rem 1.5rem;
  font-weight: 600;
}

.user-form-container .card-header h5 {
  display: flex;
  align-items: center;
  margin: 0;
}

.user-form-container .card-body {
  padding: 1.5rem;
}

.badge-status-info {
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .user-form-container .card-body .row {
    margin-bottom: 0.5rem;
  }
}
</style>
