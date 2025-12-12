<template>
  <div class="locations-management-container">
    <div class="page-header">
      <h2 class="mb-0">Locations</h2>
      <b-button variant="outline-primary" @click="loadLocations">
        <feather-icon icon="RefreshCwIcon" size="16" />
        Refresh
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group label="Search" label-for="search-input">
            <b-input-group>
              <b-form-input
                id="search-input"
                v-model="searchTerm"
                placeholder="Search by code, name, city, or contact..."
              />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" md="6">
          <b-row>
            <b-col cols="12" md="6">
              <b-form-group label="Filter by Default" label-for="default-filter" class="mb-md-0">
                <b-form-checkbox
                  id="default-filter"
                  v-model="showDefaultOnly"
                  class="mt-2"
                >
                  Show Default Only
                </b-form-checkbox>
              </b-form-group>
            </b-col>
            <b-col cols="12" md="6" class="d-flex align-items-end justify-content-md-end">
              <small class="text-muted">
                Showing {{ totalRows }} {{ totalRows === 1 ? 'location' : 'locations' }}
              </small>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <b-table
        :items="paginatedLocations"
        :fields="locationFields"
        striped
        hover
        responsive
        :busy="loading"
        show-empty
      >
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle" />
            <strong> Loading...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="MapPinIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">No locations found.</p>
          </div>
        </template>

        <template #cell(locationCode)="row">
          <strong>{{ row.item.locationCode }}</strong>
        </template>

        <template #cell(address)="row">
          <div class="small">
            <div v-if="row.item.address">{{ row.item.address }}</div>
            <div v-if="row.item.city || row.item.state || row.item.postalCode">
              {{ formatCityState(row.item) }}
            </div>
            <div v-if="row.item.country">{{ row.item.country }}</div>
          </div>
          <span v-if="!row.item.address && !row.item.city && !row.item.country" class="text-muted small">-</span>
        </template>

        <template #cell(contact)="row">
          <div class="small">
            <div v-if="row.item.phone">
              <feather-icon icon="PhoneIcon" size="12" class="mr-1" />
              {{ row.item.phone }}
            </div>
            <div v-if="row.item.email">
              <feather-icon icon="MailIcon" size="12" class="mr-1" />
              {{ row.item.email }}
            </div>
            <div v-if="row.item.contactPerson">
              <feather-icon icon="UserIcon" size="12" class="mr-1" />
              {{ row.item.contactPerson }}
            </div>
          </div>
          <span v-if="!row.item.phone && !row.item.email && !row.item.contactPerson" class="text-muted small">-</span>
        </template>

        <template #cell(isDefault)="row">
          <b-badge :variant="row.item.isDefault ? 'success' : 'secondary'">
            {{ row.item.isDefault ? 'Default' : 'No' }}
          </b-badge>
        </template>

        <template #cell(actions)="row">
          <div class="text-right">
            <b-button 
              variant="outline-primary" 
              size="sm" 
              @click="setAsDefaultLocation(row.item)"
              :disabled="row.item.isDefault"
            >
              <feather-icon icon="StarIcon" size="14" />
              Set as Default
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="per-page-select" class="mr-2 mb-0">Items per page:</label>
              <b-form-select
                id="per-page-select"
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
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalRows }} locations
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
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'LocationsManagement',
  data() {
    return {
      locations: [],
      loading: false,
      searchTerm: '',
      showDefaultOnly: false,
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
      locationFields: [
        { key: 'locationCode', label: 'Code', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'address', label: 'Address', sortable: false },
        { key: 'contact', label: 'Contact', sortable: false },
        { key: 'isDefault', label: 'Default', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false, thClass: 'text-right', tdClass: 'text-right' }
      ]
    }
  },
  computed: {
    filteredLocations() {
      let filtered = this.locations

      // Filter by default status
      if (this.showDefaultOnly) {
        filtered = filtered.filter(location => location.isDefault === true)
      }

      // Filter by search term
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(location => {
          return (
            (location.locationCode && location.locationCode.toLowerCase().includes(term)) ||
            (location.name && location.name.toLowerCase().includes(term)) ||
            (location.city && location.city.toLowerCase().includes(term)) ||
            (location.country && location.country.toLowerCase().includes(term)) ||
            (location.phone && location.phone.toLowerCase().includes(term)) ||
            (location.email && location.email.toLowerCase().includes(term))
          )
        })
      }

      return filtered
    },
    totalRows() {
      return this.filteredLocations.length
    },
    paginatedLocations() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredLocations.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    showDefaultOnly() {
      this.currentPage = 1
    },
    perPage() {
      this.currentPage = 1
    },
    filteredLocations(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    }
  },
  mounted() {
    this.loadLocations()
  },
  methods: {
    async loadLocations() {
      this.loading = true
      try {
        const response = await this.$http.get('/location')
        this.locations = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading locations:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load locations',
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    clearSearch() {
      this.searchTerm = ''
    },
    formatCityState(location) {
      return [location.city, location.state, location.postalCode].filter(Boolean).join(', ')
    },
    async setAsDefaultLocation(location) {
      try {
        const { value: confirmed } = await this.$swal({
          title: 'Set as Default Location?',
          text: `Are you sure you want to set "${location.name}" (${location.locationCode}) as the default location?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, set as default',
          cancelButtonText: 'Cancel',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary ml-1',
          },
          buttonsStyling: false,
        })

        if (!confirmed) {
          return
        }

        this.loading = true
        const response = await this.$http.put(`/location/${location.id}/set-default`, {})

        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: 'Default location updated successfully',
              variant: 'success'
            }
          })
          await this.loadLocations()
        }
      } catch (error) {
        console.error('Error setting default location:', error)
        let errorMessage = 'Failed to set default location'
        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.locations-management-container {
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

