<template>
  <div class="item-families-page">
    <div class="page-header">
      <h2 class="mb-0">Item Families</h2>
      <b-button variant="outline-primary" @click="loadFamilies" :disabled="loading">
        <feather-icon icon="RefreshCwIcon" size="16" class="mr-1" />
        Refresh
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group label="Search" label-for="family-search">
            <b-input-group>
              <b-form-input
                id="family-search"
                v-model="searchTerm"
                placeholder="Search by code, name, or description..."
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
            Showing {{ totalRows }} {{ totalRows === 1 ? 'family' : 'families' }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="mb-0">Families</h4>
        <b-button variant="primary" size="sm" @click="openFamilyModal()">
          <feather-icon icon="PlusIcon" size="14" class="mr-1" />
          Add Family
        </b-button>
      </div>

      <b-table
        :items="paginatedFamilies"
        :fields="familyFields"
        striped
        hover
        responsive
        :busy="loading"
        show-empty
        small
      >
        <template #table-busy>
          <div class="text-center text-muted my-2">
            <b-spinner class="align-middle mr-2" />
            <strong>Loading families…</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="LayersIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">No families found.</p>
          </div>
        </template>

        <template #cell(name)="row">
          <div class="font-weight-bold">{{ row.item.name }}</div>
          <div class="small text-muted" v-if="row.item.description">{{ row.item.description }}</div>
        </template>

        <template #cell(active)="row">
          <b-badge :variant="row.item.active !== false ? 'success' : 'secondary'">
            {{ row.item.active !== false ? 'Active' : 'Inactive' }}
          </b-badge>
        </template>

        <template #cell(actions)="row">
          <div class="text-right">
            <b-button size="sm" variant="outline-primary" class="mr-1" @click="openFamilyModal(row.item)">
              <feather-icon icon="Edit2Icon" size="14" />
            </b-button>
            <b-button
              size="sm"
              variant="outline-danger"
              @click="confirmDeleteFamily(row.item)"
            >
              <feather-icon icon="Trash2Icon" size="14" />
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="families-per-page" class="mr-2 mb-0">Items per page:</label>
              <b-form-select
                id="families-per-page"
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
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalRows }} families
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
      id="family-modal"
      v-model="showFamilyModal"
      :title="editingFamily ? 'Edit Family' : 'Add Family'"
      @ok="saveFamily"
      :ok-disabled="!canSaveFamily"
      @hidden="resetFamilyForm"
    >
      <b-form>
        <b-form-group label="Code *" label-for="family-code">
          <b-form-input
            id="family-code"
            v-model.trim="familyForm.code"
            placeholder="Unique code"
          />
        </b-form-group>

        <b-form-group label="Name *" label-for="family-name">
          <b-form-input
            id="family-name"
            v-model.trim="familyForm.name"
            placeholder="Family name"
          />
        </b-form-group>

        <b-form-group label="Description" label-for="family-description">
          <b-form-textarea
            id="family-description"
            v-model.trim="familyForm.description"
            rows="3"
            placeholder="Optional description"
          />
        </b-form-group>

        <b-form-group label="Display Order" label-for="family-order">
          <b-form-input
            id="family-order"
            v-model.number="familyForm.displayOrder"
            type="number"
            min="0"
          />
        </b-form-group>

        <b-form-group>
          <b-form-checkbox v-model="familyForm.active" switch>
            Active
          </b-form-checkbox>
        </b-form-group>
      </b-form>
    </b-modal>

    <b-modal
      id="delete-family-modal"
      v-model="showDeleteFamilyModal"
      title="Delete Family"
      ok-variant="danger"
      ok-title="Delete"
      @ok="deleteFamily"
    >
      <p class="mb-0">
        Are you sure you want to delete the family
        <strong v-if="familyToDelete">{{ familyToDelete.name }}</strong>?
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
  name: 'ItemFamiliesManagement',
  data() {
    return {
      families: [],
      loading: false,
      searchTerm: '',
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
      ],
      familyFields: [
        { key: 'code', label: 'Code', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'displayOrder', label: 'Order', sortable: true },
        { key: 'active', label: 'Status', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false, thClass: 'text-right', tdClass: 'text-right' },
      ],
      showFamilyModal: false,
      showDeleteFamilyModal: false,
      editingFamily: null,
      familyToDelete: null,
      familyForm: {
        code: '',
        name: '',
        description: '',
        displayOrder: 0,
        active: true,
      },
    }
  },
  computed: {
    filteredFamilies() {
      if (!this.searchTerm) {
        return this.families
      }

      const term = this.searchTerm.toLowerCase()
      return this.families.filter(family => {
        return (
          (family.code && family.code.toLowerCase().includes(term)) ||
          (family.name && family.name.toLowerCase().includes(term)) ||
          (family.description && family.description.toLowerCase().includes(term))
        )
      })
    },
    totalRows() {
      return this.filteredFamilies.length
    },
    paginatedFamilies() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredFamilies.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
    canSaveFamily() {
      return this.familyForm.code && this.familyForm.name
    },
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    perPage() {
      this.currentPage = 1
    },
    filteredFamilies(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    },
  },
  mounted() {
    this.loadFamilies()
  },
  methods: {
    loadFamilies() {
      this.loading = true
      this.$http.get('/item-family')
        .then(response => {
          this.families = Array.isArray(response.data) ? response.data : []
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
          this.loading = false
        })
    },
    clearSearch() {
      this.searchTerm = ''
    },
    openFamilyModal(family = null) {
      if (family) {
        this.editingFamily = family
        this.familyForm = {
          code: family.code || '',
          name: family.name || '',
          description: family.description || '',
          displayOrder: family.displayOrder || 0,
          active: family.active !== false,
        }
      } else {
        this.editingFamily = null
        this.familyForm = {
          code: '',
          name: '',
          description: '',
          displayOrder: 0,
          active: true,
        }
      }
      this.showFamilyModal = true
    },
    resetFamilyForm() {
      this.familyForm = {
        code: '',
        name: '',
        description: '',
        displayOrder: 0,
        active: true,
      }
      this.editingFamily = null
    },
    saveFamily() {
      const payload = {
        code: this.familyForm.code,
        name: this.familyForm.name,
        description: this.familyForm.description,
        displayOrder: this.familyForm.displayOrder || 0,
        active: this.familyForm.active !== false,
      }

      let request
      if (this.editingFamily) {
        request = this.$http.put(`/item-family/${this.editingFamily.id}`, payload)
      } else {
        request = this.$http.post('/item-family', payload)
      }

      return request.then(() => {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Success',
            icon: 'CheckIcon',
            text: `Family ${this.editingFamily ? 'updated' : 'created'} successfully.`,
            variant: 'success',
          },
        })
        this.showFamilyModal = false
        this.loadFamilies()
      }).catch(error => {
        console.error('Error saving family:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: error.response?.data || 'Failed to save family.',
            variant: 'danger',
          },
        })
        return false
      })
    },
    confirmDeleteFamily(family) {
      if (!family) return
      this.$http.get(`/item-sub-family/by-family/${family.id}`)
        .then(response => {
          const subFamilies = Array.isArray(response.data) ? response.data : []
          if (subFamilies.length > 0) {
            this.$toast({
              component: ToastificationContent,
              props: {
                title: 'Cannot Delete',
                icon: 'AlertCircleIcon',
                text: 'Delete or reassign the subfamilies before removing this family.',
                variant: 'warning',
              },
            })
          } else {
            this.familyToDelete = family
            this.showDeleteFamilyModal = true
          }
        })
        .catch(error => {
          console.error('Error checking subfamilies for family deletion:', error)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Error',
              icon: 'XIcon',
              text: 'Unable to verify subfamilies for this family.',
              variant: 'danger',
            },
          })
        })
    },
    deleteFamily() {
      if (!this.familyToDelete) return
      return this.$http.delete(`/item-family/${this.familyToDelete.id}`)
        .then(() => {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Deleted',
              icon: 'Trash2Icon',
              text: 'Family deleted successfully.',
              variant: 'success',
            },
          })
          this.loadFamilies()
        })
        .catch(error => {
          console.error('Error deleting family:', error)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Error',
              icon: 'XIcon',
              text: error.response?.data || 'Failed to delete family.',
              variant: 'danger',
            },
          })
        })
        .finally(() => {
          this.showDeleteFamilyModal = false
          this.familyToDelete = null
        })
    },
  },
}
</script>

<style scoped>
.item-families-page {
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


