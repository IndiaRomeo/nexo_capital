export const DEFAULT_ADMIN_ID = '8d183eca-6d4e-4f6a-a59b-ba258fbb7798'
export const CONTACT_MESSAGES_ADMIN_ID = '8d183eca-6d4e-4f6a-a59b-ba258fbb7798'

export const ADMIN_ROUTES = [
  {
    id: DEFAULT_ADMIN_ID,
    slug: 'admin1',
    whatsapp: '19472804624',
    whatsappLabel: '+1 (947) 280-4624',
  },
  {
    id: '8d183eca-6d4e-4f6a-a59b-ba258fbb7798',
    slug: 'camilo',
    whatsapp: '19472804624',
    whatsappLabel: '+1 (947) 280-4624',
  },
]

export const ADMIN_ROUTES_BY_ID = new Map(ADMIN_ROUTES.map(admin => [admin.id, admin]))
export const ADMIN_ROUTES_BY_SLUG = new Map(ADMIN_ROUTES.map(admin => [admin.slug, admin]))

export function getDefaultAdminRoute() {
  return ADMIN_ROUTES_BY_ID.get(DEFAULT_ADMIN_ID) || ADMIN_ROUTES[0]
}

export function getContactMessagesAdminRoute() {
  return ADMIN_ROUTES_BY_ID.get(CONTACT_MESSAGES_ADMIN_ID) || getDefaultAdminRoute()
}

export function getAdminRouteById(adminId) {
  return ADMIN_ROUTES_BY_ID.get(adminId) || null
}

export function resolveAdminRoute(searchParams) {
  const advisorSlug = searchParams.get('asesor')
  if (advisorSlug && ADMIN_ROUTES_BY_SLUG.has(advisorSlug)) {
    return ADMIN_ROUTES_BY_SLUG.get(advisorSlug)
  }

  const adminId = searchParams.get('admin')
  if (adminId && ADMIN_ROUTES_BY_ID.has(adminId)) {
    return ADMIN_ROUTES_BY_ID.get(adminId)
  }

  return getDefaultAdminRoute()
}
