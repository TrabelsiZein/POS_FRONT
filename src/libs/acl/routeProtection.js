import ability from './ability'

export const canNavigate = to => to.matched.some(route => (ability.can(route.meta.action, route.meta.resource) || route.meta.resource == undefined))

export const _ = undefined
