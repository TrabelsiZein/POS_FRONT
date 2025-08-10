<template>
  <div class="customizer d-none d-md-block" :class="{ 'open': isCustomizerOpen }" v-if="loaded">
    <!-- Toggler -->
    <b-link class="customizer-toggle d-flex align-items-center justify-content-center"
      @click="isCustomizerOpen = !isCustomizerOpen">
      <feather-icon icon="SettingsIcon" size="15" class="spinner" />
    </b-link>
    <!-- /Toggler -->

    <!-- Header -->
    <div class="customizer-section d-flex justify-content-between align-items-center">
      <div>
        <h4 class="text-uppercase mb-0">
          Personnalisateur de liste
        </h4>
        <small>Personnaliser &amp; prévisualiser en temps réel</small>
      </div>
      <feather-icon icon="XIcon" size="18" class="cursor-pointer" @click="isCustomizerOpen = !isCustomizerOpen" />
    </div>
    <!-- Header -->


    <!-- SECTION: Menu -->
    <div class="customizer-section">

      <!-- S'adapter à la taille de l'écran -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="font-weight-bold">S'adapter à la taille de l'écran</span>
        <b-form-checkbox v-model="localSizeColumnsToFit" name="is-vertical-menu-collapsed" class="mr-0" switch inline
          @change="$emit('sizeColumnsToFit', localSizeColumnsToFit)" />
      </div>
      <!-- S'adapter à la taille de l'écran -->

      <!-- Sélection multi-lignes -->
      <div class="d-flex justify-content-between align-items-center">
        <span class="font-weight-bold">Sélection multi-lignes</span>
        <b-form-checkbox v-model="localMultiRowSelection" name="is-vertical-menu-collapsed" class="mr-0" switch inline
          @change="$emit('multiRowSelectionChanged', localMultiRowSelection)" />
      </div>
      <!-- Sélection multi-lignes -->

    </div>

    <vue-perfect-scrollbar :settings="perfectScrollbarSettings" class="ps-customizer-area scroll-area ">
      <!-- Afficher/Masquer les colonnes -->
      <div class="customizer-section mb-5">

        <h6 class="mb-2">Afficher/Masquer les colonnes</h6>
        <!-- Search Input -->
        <b-form-input @input="searchField" placeholder="Rechercher une colonne..." size="sm" class="mb-1" />
        <!-- /Search Input -->
        <!-- <div v-for="col in visibleColumns" :key="col.colId" class="d-flex align-items-center mb-1">
          <b-form-checkbox v-model="col.visible" @change="toggleColumn(col)">
            {{ col.headerName || col.colId }}
          </b-form-checkbox>
        </div> -->

        <draggable v-model="visibleColumns" tag="ul" class="list-group list-group-flush cursor-move" @end="onDragEnd">
          <b-list-group-item v-for="(col, index) in visibleColumns" :key="index" tag="li">
            <b-form-checkbox v-model="col.visible" @change="toggleColumn(col)">
              <strong> {{ col.headerName || col.colId }}</strong>
            </b-form-checkbox>
          </b-list-group-item>
        </draggable>

      </div>
      <!-- Afficher/Masquer les colonnes -->

    </vue-perfect-scrollbar>
  </div>
</template>

<script>


import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import draggable from 'vuedraggable'


export default {
  components: {
    VuePerfectScrollbar,
    draggable
  },
  props: {
    columnApi: {
      type: Object,
      required: true
    },
    gridApi: {
      type: Object,
      required: true
    },
    sizeColumnsToFit: {
      type: Boolean,
      default: true,
    },
    multiRowSelection: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      localSizeColumnsToFit: this.sizeColumnsToFit,
      localMultiRowSelection: this.multiRowSelection,
      isCustomizerOpen: false,
      visibleColumns: [],
      perfectScrollbarSettings: {
        maxScrollbarLength: 60,
        wheelPropagation: false,
      },
      loaded: false,
    }
  },
  watch: {
    columnApi: {
      handler(api) {
        if (api?.getAllColumns) {
          const all = api.getAllColumns().map(col => {
            const state = api.getColumnState().find(c => c.colId === col.getColId()) || {};
            return {
              colId: col.getColId(),
              headerName: col.getColDef().headerName,
              visible: !state.hide
            };
          }).filter(col => col.colId !== '__checkbox__'); // Exclude checkbox column
          this.visibleColumns = all;
          this.$emit('visibleColumnsChanged', this.visibleColumns);
        }
      },
      immediate: true
    },
    sizeColumnsToFit(newVal) {
      this.localSizeColumnsToFit = newVal;
    },
  },
  methods: {
    toggleColumn(col) {
      if (!this.columnApi) return;
      this.columnApi.setColumnVisible(col.colId, col.visible);
      this.localSizeColumnsToFit = false;
    },
    changeColumnToFit() {
      this.$emit('sizeColumnsToFit', this.localSizeColumnsToFit);
    },
    showColumns() {
      const searchValue = this.searchField.toLowerCase();
      const filterColumns = this.columnApi.getAllColumns().filter(col => col.headerName.toLowerCase().includes(searchValue));
      const all = filterColumns.map(col => {
        const state = filterColumns.find(c => c.colId === col.getColId()) || {};
        return {
          colId: col.getColId(),
          headerName: col.getColDef().headerName,
          visible: !state.hide
        };
      });
      this.visibleColumns = all;
    },
    searchField(value) {
      const all = this.columnApi.getAllColumns().map(col => {
        const state = this.columnApi.getColumnState().find(c => c.colId === col.getColId()) || {};
        return {
          colId: col.getColId(),
          headerName: col.getColDef().headerName,
          visible: !state.hide
        };
      });
      this.visibleColumns = all.filter(col => col.headerName.toLowerCase().includes(value.toLowerCase()));
    },
    onDragEnd() {
      // Step 1: Create a new column state with the new order
      const newColumnState = this.visibleColumns.map((col, index) => ({
        colId: col.colId,
        order: index,
        hide: !col.visible,
      }));

      // Step 2: Get the current full state and apply new order
      const fullState = this.columnApi.getColumnState();

      const updatedState = newColumnState.map(col => {
        const original = fullState.find(c => c.colId === col.colId);
        return {
          ...original,
          hide: col.hide,
        };
      });

      // Step 3: Apply the new column state with updated order
      this.columnApi.applyColumnState({
        state: updatedState,
        applyOrder: true,
      });
    },
  },
  created() {
    setTimeout(() => {
      this.loaded = true;
    }, 500);
  }
}

</script>

<style lang="scss" scoped>
@import '~@core/scss/base/bootstrap-extended/include';
@import '~@core/scss/base/components/variables-dark';

.customizer-section {
  padding: 1.5rem;
  border-bottom: 1px solid #ebe9f1;

  .dark-layout & {
    border-color: $theme-dark-border-color;
  }

  #skin-radio-group ::v-deep {
    .custom-control-inline {
      margin-right: 0.7rem;
    }
  }

  .form-group {
    margin-bottom: 1.5rem;
    ;

    &:last-of-type {
      margin-bottom: 0;
    }

    ::v-deep legend {
      font-weight: 500;
    }
  }
}

.mark-active {
  box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, .5);
}

.ps-customizer-area {
  height: calc(100% - 83px)
}
</style>