<template>
  <div class="cron-builder">
    <b-row>
      <b-col cols="12">
        <b-form-group>
          <label class="mb-2">Schedule</label>

          <b-form-select v-model="presetType" :options="presetTypeOptions" class="mb-3"
            @change="onPresetTypeChange" />

          <!-- Every Minute -->
          <div v-if="presetType === 'minute'" class="preset-config">
            <b-form-group label="Every N minutes" label-for="minute-interval">
              <b-form-select id="minute-interval" v-model="minuteInterval" :options="minuteIntervalOptions"
                @change="generateCron" />
            </b-form-group>
          </div>

          <!-- Every Hour -->
          <div v-if="presetType === 'hour'" class="preset-config">
            <b-form-group label="Every N hours" label-for="hour-interval">
              <b-form-select id="hour-interval" v-model="hourInterval" :options="hourIntervalOptions"
                @change="generateCron" />
            </b-form-group>
            <b-form-group label="At minute" label-for="hour-minute">
              <b-form-select id="hour-minute" v-model="hourMinute" :options="hourMinuteOptions"
                @change="generateCron" />
            </b-form-group>
          </div>

          <!-- Daily -->
          <div v-if="presetType === 'day'" class="preset-config">
            <b-form-group label="Time" label-for="daily-time">
              <b-form-timepicker id="daily-time" v-model="dailyTime" locale="en" @input="generateCron" />
            </b-form-group>
          </div>

          <!-- Weekly -->
          <div v-if="presetType === 'week'" class="preset-config">
            <b-form-group label="Day of week" label-for="weekday">
              <b-form-select id="weekday" v-model="weekday" :options="weekdayOptions" @change="generateCron" />
            </b-form-group>
            <b-form-group label="Time" label-for="weekly-time">
              <b-form-timepicker id="weekly-time" v-model="weeklyTime" locale="en" @input="generateCron" />
            </b-form-group>
          </div>

          <!-- Monthly -->
          <div v-if="presetType === 'month'" class="preset-config">
            <b-form-group label="Day of month" label-for="month-day">
              <b-form-select id="month-day" v-model="monthDay" :options="monthDayOptions"
                @change="generateCron" />
            </b-form-group>
            <b-form-group label="Time" label-for="monthly-time">
              <b-form-timepicker id="monthly-time" v-model="monthlyTime" locale="en" @input="generateCron" />
            </b-form-group>
          </div>
        </b-form-group>
      </b-col>
    </b-row>

    <!-- Preview -->
    <b-row v-if="cronDescription">
      <b-col cols="12">
        <b-alert variant="info" show class="mb-0">
          <strong>Schedule:</strong> {{ cronDescription }}
        </b-alert>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { cronToHumanReadable, isValidCronExpression } from '@/utils/cronParser'

export default {
  name: 'CronBuilder',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    // Generate minute interval options (1-60)
    const minuteIntervalOptions = []
    for (let i = 1; i <= 60; i++) {
      minuteIntervalOptions.push({
        value: i,
        text: i === 1 ? 'Every 1 minute' : `Every ${i} minutes`,
      })
    }

    // Generate hour interval options (1-23)
    const hourIntervalOptions = []
    for (let i = 1; i <= 23; i++) {
      hourIntervalOptions.push({
        value: i,
        text: i === 1 ? 'Every 1 hour' : `Every ${i} hours`,
      })
    }

    // Generate minute options (0-59)
    const hourMinuteOptions = []
    for (let i = 0; i <= 59; i++) {
      hourMinuteOptions.push({
        value: i,
        text: String(i).padStart(2, '0'),
      })
    }

    // Generate month day options (1-28)
    const monthDayOptions = []
    for (let i = 1; i <= 28; i++) {
      monthDayOptions.push({
        value: i,
        text: String(i),
      })
    }

    return {
      cronExpression: this.value || '',

      // Preset builder data
      presetType: 'day',
      presetTypeOptions: [
        { value: 'minute', text: 'Every N minutes' },
        { value: 'hour', text: 'Every N hours' },
        { value: 'day', text: 'Daily at specific time' },
        { value: 'week', text: 'Weekly on specific day' },
        { value: 'month', text: 'Monthly on specific day' },
      ],
      minuteInterval: 5,
      minuteIntervalOptions,
      hourInterval: 1,
      hourIntervalOptions,
      hourMinute: 0,
      hourMinuteOptions,
      dailyTime: '02:00',
      weekday: '1',
      weekdayOptions: [
        { value: '0', text: 'Sunday' },
        { value: '1', text: 'Monday' },
        { value: '2', text: 'Tuesday' },
        { value: '3', text: 'Wednesday' },
        { value: '4', text: 'Thursday' },
        { value: '5', text: 'Friday' },
        { value: '6', text: 'Saturday' },
      ],
      weeklyTime: '02:00',
      monthDay: 1,
      monthDayOptions,
      monthlyTime: '02:00',
    }
  },
  computed: {
    cronDescription() {
      if (!this.cronExpression || this.cronError) {
        return null
      }
      return cronToHumanReadable(this.cronExpression)
    },
  },
  watch: {
    value(newValue) {
      if (newValue !== this.cronExpression) {
        this.cronExpression = newValue || ''
        if (this.cronExpression) {
          this.parseCronToPreset()
        }
        this.validateCron()
      }
    },
  },
  mounted() {
    if (this.cronExpression) {
      this.parseCronToPreset()
    }
  },
  methods: {
    generateCron() {
      let cron = ''
      switch (this.presetType) {
        case 'minute':
          cron = `0 */${this.minuteInterval} * * * *`
          break
        case 'hour':
          cron = `0 ${this.hourMinute} */${this.hourInterval} * * *`
          break
        case 'day':
          if (this.dailyTime) {
            const [hour, minute] = this.dailyTime.split(':')
            cron = `0 ${minute} ${hour} * * *`
          }
          break
        case 'week':
          if (this.weeklyTime) {
            const [hour, minute] = this.weeklyTime.split(':')
            cron = `0 ${minute} ${hour} * * ${this.weekday}`
          }
          break
        case 'month':
          if (this.monthlyTime) {
            const [hour, minute] = this.monthlyTime.split(':')
            cron = `0 ${minute} ${hour} ${this.monthDay} * *`
          }
          break
      }
      if (cron) {
        this.cronExpression = cron
        this.$emit('input', cron)
        this.validateCron()
      }
    },
    parseCronToPreset() {
      if (!this.cronExpression) {
        return
      }
      const parts = this.cronExpression.trim().split(/\s+/)
      if (parts.length < 5) {
        return
      }

      const is6Field = parts.length === 6
      const minute = parts[is6Field ? 1 : 0]
      const hour = parts[is6Field ? 2 : 1]
      const day = parts[is6Field ? 3 : 2]
      const weekday = parts[is6Field ? 5 : 4]

      // Try to detect preset type
      if (minute.startsWith('*/') && hour === '*' && day === '*' && weekday === '*') {
        this.presetType = 'minute'
        this.minuteInterval = parseInt(minute.substring(2), 10) || 5
      } else if (hour.startsWith('*/') && day === '*' && weekday === '*') {
        this.presetType = 'hour'
        this.hourInterval = parseInt(hour.substring(2), 10) || 1
        this.hourMinute = parseInt(minute, 10) || 0
      } else if (day === '*' && weekday === '*') {
        this.presetType = 'day'
        const h = parseInt(hour, 10) || 2
        const m = parseInt(minute, 10) || 0
        this.dailyTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      } else if (day === '*' && weekday !== '*') {
        this.presetType = 'week'
        this.weekday = weekday
        const h = parseInt(hour, 10) || 2
        const m = parseInt(minute, 10) || 0
        this.weeklyTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      } else if (day !== '*' && weekday === '*') {
        this.presetType = 'month'
        this.monthDay = parseInt(day, 10) || 1
        const h = parseInt(hour, 10) || 2
        const m = parseInt(minute, 10) || 0
        this.monthlyTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
    },
    validateCron() {
      if (!this.cronExpression) {
        return
      }

      if (!isValidCronExpression(this.cronExpression)) {
        return
      }

      // Emit the valid CRON expression
      this.$emit('input', this.cronExpression)
    },
    onPresetTypeChange() {
      this.generateCron()
    },
  },
}
</script>

<style scoped>
.cron-builder {
  padding: 10px;
}

.preset-config {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>

