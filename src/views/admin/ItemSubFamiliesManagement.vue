<template>
  <div class="item-subfamilies-page">
    <div class="page-header">
      <h2 class="mb-0">Item Subfamilies</h2>
      <b-button variant="outline-primary" @click="refreshData" :disabled="loadingSubFamilies || loadingFamilies">
        <feather-icon icon="RefreshCwIcon" size="16" class="mr-1" />
        Refresh
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group label="Search" label-for="subfamily-search">
            <b-input-group>
              <b-form-input
                id="subfamily-search"
                v-model="searchTerm"
                placeholder="Search by code, name, description, or family..."
              />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" md="6" class="d-flex align-items-end justify-content-md-end">
          <small class="text-muted">
            Showing {{ totalRows }} {{ totalRows === 1 ? 'subfamily' : 'subfamilies' }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="mb-0">Subfamilies</h4>
        <b-button variant="primary" size="sm" @click="openSubFamilyModal()">
          <feather-icon icon="PlusIcon" size="14" class="mr-1" />
          Add Subfamily
        </b-button>
      </div>

      <b-alert v-if="families.length === 0 && !loadingFamilies" variant="warning" show class="mb-3">
        You must create at least one item family before adding subfamilies.
      </b-alert>

      <b-table
        :items="paginatedSubFamilies"
        :fields="subFamilyFields"
        striped
        hover
        responsive
        small
        :busy="loadingSubFamilies"
        show-empty
      >
        <template #table-busy>
          <div class="text-center text-muted my-2">
            <b-spinner class="align-middle mr-2" />
            <strong>Loading subfamilies…</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="GridIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">No subfamilies found.</p>
          </div>
        </template>

        <template #cell(name)="row">
          <div class="font-weight-bold">{{ row.item.name }}</div>
          <div class="small text-muted" v-if="row.item.description">{{ row.item.description }}</div>
        </template>

        <template #cell(itemFamily)="row">
          <span v-if="row.item.itemFamily">{{ row.item.itemFamily.name }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(active)="row">
          <b-badge :variant="row.item.active !== false ? 'success' : 'secondary'">
            {{ row.item.active !== false ? 'Active' : 'Inactive' }}
          </b-badge>
        </template>

        <template #cell(actions)="row">
          <div class="text-right">
            <b-button size="sm" variant="outline-primary" class="mr-1" @click="openSubFamilyModal(row.item)">
              <feather-icon icon="Edit2Icon" size="14" />
            </b-button>
            <b-button size="sm" variant="outline-danger" @click="confirmDeleteSubFamily(row.item)">
              <feather-icon icon="Trash2Icon" size="14" />
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="subfamilies-per-page" class="mr-2 mb-0">Items per page:</label>
              <b-form-select
                id="subfamilies-per-page"
                v-model="perPage"
                :options="perPageOptions"
                size="sm"
                style="width: auto;"
              />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalRows }} subfamilies
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="center"
          />
        </div>
      </div>
    </b-card>

    <b-modal
      id="subfamily-modal"
      v-model="showSubFamilyModal"
      :title="editingSubFamily ? 'Edit Subfamily' : 'Add Subfamily'"
      @ok="saveSubFamily"
      :ok-disabled="!canSaveSubFamily"
      @hidden="resetSubFamilyForm"
    >
      <b-form>
        <b-form-group label="Family *" label-for="subfamily-family">
          <b-form-select
            id="subfamily-family"
            v-model="subFamilyForm.itemFamilyId"
            :options="familyOptions"
            :disabled="families.length === 0"
          />
        </b-form-group>

        <b-form-group label="Code *" label-for="subfamily-code">
          <b-form-input
            id="subfamily-code"
            v-model.trim="subFamilyForm.code"
            placeholder="Unique code"
          />
        </b-form-group>

        <b-form-group label="Name *" label-for="subfamily-name">
          <b-form-input
            id="subfamily-name"
            v-model.trim="subFamilyForm.name"
            placeholder="Subfamily name"
          />
        </b-form-group>

        <b-form-group label="Description" label-for="subfamily-description">
          <b-form-textarea
            id="subfamily-description"
            v-model.trim="subFamilyForm.description"
            rows="3"
            placeholder="Optional description"
          />
        </b-form-group>

        <b-form-group label="Display Order" label-for="subfamily-order">
          <b-form-input
            id="subfamily-order"
            v-model.number="subFamilyForm.displayOrder"
            type="number"
            min="0"
          />
        </b-form-group>

        <b-form-group>
          <b-form-checkbox v-model="subFamilyForm.active" switch>
            Active
          </b-form-checkbox>
        </b-form-group>
      </b-form>
    </b-modal>

    <b-modal
      id="delete-subfamily-modal"
      v-model="showDeleteSubFamilyModal"
      title="Delete Subfamily"
      ok-variant="danger"
      ok-title="Delete"
      @ok="deleteSubFamily"
    >
      <p class="mb-0">
        Are you sure you want to delete the subfamily
        <strong v-if="subFamilyToDelete">{{ subFamilyToDelete.name }}</strong>?
      </p>
      <p class="text-danger small mb-0">
        This action cannot be undone.
      </p>
    </b-modal>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'ItemSubFamiliesManagement',
  data() {
    return {
      subFamilies: [],
      families: [],
      loadingSubFamilies: false,
      loadingFamilies: false,
      searchTerm: '',
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
      ],
      subFamilyFields: [
        { key: 'code', label: 'Code', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'itemFamily', label: 'Family', sortable: true },
        { key: 'displayOrder', label: 'Order', sortable: true },
        { key: 'active', label: 'Status', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false, thClass: 'text-right', tdClass: 'text-right' },
      ],
      showSubFamilyModal: false,
      showDeleteSubFamilyModal: false,
      editingSubFamily: null,
      subFamilyToDelete: null,
      subFamilyForm: {
        code: '',
        name: '',
        description: '',
        displayOrder: 0,
        active: true,
        itemFamilyId: null,
      },
    }
  },
  computed: {
    filteredSubFamilies() {
      if (!this.searchTerm) {
        return this.subFamilies
      }

      const term = this.searchTerm.toLowerCase()
      return this.subFamilies.filter(sub => {
        const familyName = sub.itemFamily && sub.itemFamily.name ? sub.itemFamily.name.toLowerCase() : ''
        return (
          (sub.code && sub.code.toLowerCase().includes(term)) ||
          (sub.name && sub.name.toLowerCase().includes(term)) ||
          (sub.description && sub.description.toLowerCase().includes(term)) ||
          (familyName && familyName.includes(term))
        )
      })
    },
    totalRows() {
      return this.filteredSubFamilies.length
    },
    paginatedSubFamilies() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredSubFamilies.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
    familyOptions() {
      const options = this.families
        .filter(family => family.active !== false)
        .sort((a, b) => {
          const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0)
          if (orderDiff !== 0) return orderDiff
          return a.name.localeCompare(b.name)
        })
        .map(family => ({ value: family.id, text: family.name }))

      if (options.length === 0) {
        options.push({ value: null, text: 'No families available' })
      }

      return options
    },
    canSaveSubFamily() {
      return (
        this.subFamilyForm.code &&
        this.subFamilyForm.name &&
        this.subFamilyForm.itemFamilyId
      )
    },
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    perPage() {
      this.currentPage = 1
    },
    filteredSubFamilies(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    },
  },
  mounted() {
    this.refreshData()
  },
  methods: {
    refreshData() {
      this.loadFamilies()
      this.loadSubFamilies()
    },
    loadSubFamilies() {
      this.loadingSubFamilies = true
      this.$http.get('/item-sub-family')
        .then(response => {
          this.subFamilies = Array.isArray(response.data) ? response.data : []
        })
        .catch(error => {
          console.error('Error loading item subfamilies:', error)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Error',
              icon: 'XIcon',
              text: 'Failed to load item subfamilies.',
              variant: 'danger',
            },
          })
        })
        .finally(() => {
          this.loadingSubFamilies = false
        })
    },
    loadFamilies() {
      this.loadingFamilies = true
      this.$http.get('/item-family')
        .then(response => {
          this.families = Array.isArray(response.data) ? response.data : []
          if (this.families.length > 0 && !this.subFamilyForm.itemFamilyId) {
            this.subFamilyForm.itemFamilyId = this.families[0].id
          }
        })
        .catch(error => {
          console.error('Error loading item families:', error)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Error',
              icon: 'XIcon',
              text: 'Failed to load item families.',
              variant: 'danger',
            },
          })
        })
        .finally(() => {
          this.loadingFamilies = false
        })
    },
    clearSearch() {
      this.searchTerm = ''
    },
    openSubFamilyModal(subFamily = null) {
      if (this.families.length === 0) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'No Families',
            icon: 'AlertCircleIcon',
            text: 'Create an item family before adding subfamilies.',
            variant: 'warning',
          },
        })
        return
      }

      if (subFamily) {
        this.editingSubFamily = subFamily
        this.subFamilyForm = {
          code: subFamily.code || '',
          name: subFamily.name || '',
          description: subFamily.description || '',
          displayOrder: subFamily.displayOrder || 0,
          active: subFamily.active !== false,
          itemFamilyId: subFamily.itemFamily ? subFamily.itemFamily.id : null,
        }
      } else {
        this.editingSubFamily = null
        this.subFamilyForm = {
          code: '',
          name: '',
          description: '',
          displayOrder: 0,
          active: true,
          itemFamilyId: this.families.length > 0 ? this.families[0].id : null,
        }
      }

      this.showSubFamilyModal = true
    },
    resetSubFamilyForm() {
      this.editingSubFamily = null
      this.subFamilyForm = {
        code: '',
        name: '',
        description: '',
        displayOrder: 0,
        active: true,
        itemFamilyId: this.families.length > 0 ? this.families[0].id : null,
      }
    },
    saveSubFamily() {
      const payload = {
        code: this.subFamilyForm.code,
        name: this.subFamilyForm.name,
        description: this.subFamilyForm.description,
        displayOrder: this.subFamilyForm.displayOrder || 0,
        active: this.subFamilyForm.active !== false,
        itemFamily: { id: this.subFamilyForm.itemFamilyId },
      }

      let request
      if (this.editingSubFamily) {
        request = this.$http.put(`/item-sub-family/${this.editingSubFamily.id}`, payload)
      } else {
        request = this.$http.post('/item-sub-family', payload)
      }

      return request.then(() => {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Success',
            icon: 'CheckIcon',
            text: `Subfamily ${this.editingSubFamily ? 'updated' : 'created'} successfully.`,
            variant: 'success',
          },
        })
        this.showSubFamilyModal = false
        this.loadSubFamilies()
      }).catch(error => {
        console.error('Error saving subfamily:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: error.response?.data || 'Failed to save subfamily.',
            variant: 'danger',
          },
        })
        return false
      })
    },
    confirmDeleteSubFamily(subFamily) {
      this.subFamilyToDelete = subFamily
      this.showDeleteSubFamilyModal = true
    },
    deleteSubFamily() {
      if (!this.subFamilyToDelete) return
      return this.$http.delete(`/item-sub-family/${this.subFamilyToDelete.id}`)
        .then(() => {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Deleted',
              icon: 'Trash2Icon',
              text: 'Subfamily deleted successfully.',
              variant: 'success',
            },
          })
          this.loadSubFamilies()
        })
        .catch(error => {
          console.error('Error deleting subfamily:', error)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Error',
              icon: 'XIcon',
              text: error.response?.data || 'Failed to delete subfamily.',
              variant: 'danger',
            },
          })
        })
        .finally(() => {
          this.showDeleteSubFamilyModal = false
          this.subFamilyToDelete = null
        })
    },
  },
}
</script>

<style scoped>
.item-subfamilies-page {
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

.table td {
  vertical-align: middle;
}
</style>


