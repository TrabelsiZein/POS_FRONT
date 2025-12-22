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

        <template #cell(actions)="row">
          <b-button-group size="sm">
            <b-button variant="outline-primary" @click="editUser(row.item)" :disabled="row.item.role === 'ADMIN'">
              <feather-icon icon="EditIcon" size="14" />
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
    <b-modal v-model="showAddUserModal" :title="editingUser ? $t('admin.userManagement.editUser') : $t('admin.userManagement.addNewUser')" @ok="saveUser"
      @cancel="resetUserForm">
      <b-form>
        <b-form-group :label="$t('admin.userManagement.form.username')" label-for="username">
          <b-form-input id="username" v-model="userForm.username" :disabled="editingUser" required />
        </b-form-group>

        <b-form-group :label="$t('admin.userManagement.form.fullName')" label-for="fullName">
          <b-form-input id="fullName" v-model="userForm.fullName" />
        </b-form-group>

        <b-form-group :label="$t('admin.userManagement.form.email')" label-for="email">
          <b-form-input id="email" v-model="userForm.email" type="email" />
        </b-form-group>

        <b-form-group :label="$t('admin.userManagement.form.password')" label-for="password">
          <b-form-input id="password" v-model="userForm.password" type="password" :required="!editingUser" />
          <small class="form-text text-muted" v-if="editingUser">
            {{ $t('admin.userManagement.form.passwordHelp') }}
          </small>
        </b-form-group>

        <b-form-group :label="$t('admin.userManagement.form.role')" label-for="role">
          <b-form-select id="role" v-model="userForm.role" :options="roleOptions" required />
        </b-form-group>

        <b-form-group :label="$t('admin.userManagement.form.status')" v-if="editingUser">
          <b-form-checkbox v-model="userForm.active">
            {{ $t('admin.userManagement.status.active') }}
          </b-form-checkbox>
        </b-form-group>
      </b-form>
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
      editingUser: null,
      userToDelete: null,
      userForm: {
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'POS_USER',
        active: true
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
    editUser(user) {
      this.editingUser = user
      this.userForm = {
        username: user.username,
        fullName: user.fullName || '',
        email: user.email || '',
        password: '',
        role: user.role,
        active: user.active
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
            active: this.userForm.active
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
        active: true
      }
      this.showAddUserModal = false
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
</style>
