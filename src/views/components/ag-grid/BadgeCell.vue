<template>
    <div id="badge-component">

        <!-- CustomerByCompany -->
        <div v-if="params.componentName == 'UsersManagement'" style="cursor:pointer;">
            <b-badge bill variant="success" v-if="params.data.active">
                Active
            </b-badge>
            <b-badge bill variant="danger" v-else>
                Not Active
            </b-badge>
        </div>
        <!-- CustomerByCompany -->

    </div>
</template>
  
<script>
